"use strict";

var _ = require("underscore"),
    path = require("path"),
    fs = require("fs");

var nconf = require("nconf");

var SimpleExpressServer = require("./SimpleExpressServer.js"),
    SimpleSocketServer = require("./SimpleSocketIOServer.js");

var Watcher = require("./Watcher.js");

var Hooks = require("./Hooks.js");
var BundlerFactory = require("./BundlerFactory.js");
var ClientTest = require("./ClientTest.js");

var useragent = require("useragent");

function start() {

    nconf.argv();

        //Server config
    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        clientLibFolderPath = path.resolve(__dirname + "/client/"),
        testFolderPath = process.cwd(),
        libFolderPath = testFolderPath.replace("test", "lib"), //replace first occurrence of test in path with lib

        //(express- & socket.io-) servers
        simpleExpressServer,
        expressServer,
        socketIOServer,

        bundler,
        bundlerFolderPath = path.resolve(__dirname + "/bundler") + "/",
        bundlerFactory = new BundlerFactory(),

        //Regular hooks
        hooks,
        hooksFilePath = testFolderPath + "/nof5.hooks.js",
        hooksFileStat,

        //Browserify-only hooks
        BrowserifyHooks,
        browserifyHooks,
        browserifyHooksFilePath = testFolderPath + "/nof5.browserify.js",
        browserifyHooksFileStat,

        clientCollection = [],

        //Initialize watcher
        libWatcher,
        testWatcher = new Watcher(testFolderPath);

        //testDirMasterWatcher.watch(testFolderPath);

    //Assume path to lib/
    try {
        //libDirMasterWatcher.watch(libFolderPath);
        libWatcher = new Watcher(libFolderPath);
    } catch (error) {
        console.warn("(nof5) unable to resolve lib path. Assumed path to lib: " + libFolderPath, error.message);
    }

    //Init hooks
    try {
        hooksFileStat = fs.statSync(hooksFilePath);
        if (hooksFileStat.isFile()) {
            hooks = new Hooks();
            hooks.init(hooksFilePath);
        }
    } catch (error) {
        console.error("(nof5) Unable to read hooks from " + hooksFilePath + ".", error);
    }

    //@TODO else path for other bundlers is missing
    //Init Browsierfy-Bundler
    if (useBrowserify) {

        bundler = bundlerFactory.build(bundlerFolderPath + "Browserify.js", testFolderPath);

        try {
            browserifyHooksFileStat = fs.statSync(browserifyHooksFilePath);
        } catch (error) {

        }

        if ((browserifyHooksFileStat instanceof fs.Stats) && browserifyHooksFileStat.isFile()) {
            BrowserifyHooks = require(bundlerFolderPath + "BrowserifyHooks.js");
            browserifyHooks = new BrowserifyHooks(browserifyHooksFilePath, bundler);
            //Enable hooks like use or irgnore for Browserify-Bundler
            browserifyHooks.exec();
        }

    } else {
        bundler = bundlerFactory.build(bundlerFolderPath + "NOF5.js", testFolderPath);
    }

    //Create express-server
    simpleExpressServer = new SimpleExpressServer([
            clientLibFolderPath,
            testFolderPath
        ],
        port
    );
    //Config
    simpleExpressServer.get("/tests.js", function getTestScripts(req, res) {
        hooks.exec();

        res.header("Content-Type", "text/javascript");
        res.end(bundler.get());
    });

    //Start express-server
    expressServer = simpleExpressServer.start();

    //Create the socket.io-server
    socketIOServer = new SimpleSocketServer(expressServer);

    function onDirChange() {
        console.info(
            new Date().toLocaleTimeString() +
                " re-running tests \n"
        );
    }

    libWatcher.on("change", onDirChange);
    testWatcher.on("change", onDirChange);

    //Add some listeners to the socket.io-server
    socketIOServer.on("connect", function (socket) {

        socket.once("hello", function onHello(userAgentString) {

            var clientTest = new ClientTest(userAgentString, socket),
                hasResponded = false,
                responseTimeOut = 20000,
                killTimerId = setInterval(function checkResponse() {
                    clearInterval(killTimerId);
                    if (!hasResponded) {
                        socket.emit("disconnect");
                        console.info(
                            new Date().toLocaleTimeString() + " " +
                            clientTest.getName() +
                            " has not responded within " + responseTimeOut / 1000 + " seconds: " +
                            "Connection closed."
                        );
                    }
                }, responseTimeOut);

            function f5Emitter() {
                socket.emit("f5");
            }

            console.info(
                new Date().toLocaleTimeString() + " " +
                clientTest.getName() +
                " has connected \n"
            );

            clientTest.on("end", function onEnd() {
                var errors = clientTest.getErrors();

                hasResponded = true;

                console.info(
                    new Date().toLocaleTimeString() + " " +
                        clientTest.toString() + "\n"
                );
                if(errors) {
                    console.dir(errors);
                    console.log("\n");
                }
            });

            libWatcher.on("change", f5Emitter);
            testWatcher.on("change", f5Emitter);

            clientCollection.push({
                "socket": socket,
                "test": clientTest,
                "f5Emitter": f5Emitter
            });
        });

    });

    socketIOServer.on("reconnect", function (socket) {

        var client = _(clientCollection).find(function clientCollectionIterator(clientData) {
            return clientData.socket.id === socket.id;
        });

        console.info(
            new Date().toLocaleTimeString() + " " +
            client.test.getName() +
            " has re-connected \n"
        );

    });

    socketIOServer.on("disconnect", function onDisconnect(socket) {

        var client = _(clientCollection).find(function clientCollectionIterator(clientData) {
            return clientData.socket === socket;
        });

        client.test.removeAllListeners();
        socket.removeAllListeners(); //@TODO This is the job of the SimpleSocketIOServer
        libWatcher.removeListener("change", client.f5Emitter);
        testWatcher.removeListener("change", client.f5Emitter);
        console.info(
            new Date().toLocaleTimeString() + " " +
            client.test.getName() +
            " has dis-connected \n"
        );

    });

    socketIOServer.start();
}

exports.start = start;
