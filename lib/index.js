"use strict";

var _ = require("underscore"),
    fs = require("fs");

var nconf = require("nconf");

var SimpleExpressServer = require("./SimpleExpressServer.js"),
    SimpleSocketServer = require("./SimpleSocketIOServer.js");

var DirectoryMasterWatcher = require("./DirectoryMasterWatcher.js");

var Hooks = require("./Hooks.js");
var Bundler = require("./Bundler.js");
var ClientTest = require("./ClientTest.js");

var useragent = require("useragent");

function start() {

    nconf.argv();

        //Server config
    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        testFolderPath = process.cwd(),
        libFolderPath = testFolderPath.replace("test", "lib"), //replace first occurrence of test in path with lib

        //(express- & socket.io-) servers
        simpleExpressServer,
        expressServer,
        socketIOServer,

        bundler,
        bundlerPath = __dirname + "/bundler/",

        //Regular hooks
        hooks,
        hooksFilePath = testFolderPath + "/nof5.hooks.js",
        hooksFileStat,

        //Browserify-only hooks
        BrowserifyHooks,
        browserifyHooks,
        browserifyHooksFilePath = testFolderPath + "nof5.browserify.js",
        browserifyHooksFileStat,

        clientCollection = [],

        //Initialize watcher
        libDirMasterWatcher = new DirectoryMasterWatcher(),
        testDirMasterWatcher = new DirectoryMasterWatcher();

        testDirMasterWatcher.watch(testFolderPath);

    //Assume path to lib/
    try {
        libDirMasterWatcher.watch(libFolderPath);
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

    //Init Browsierfy-Bundler
    if (useBrowserify) {

        bundler = new Bundler(bundlerPath + "Browserify.js", testFolderPath);

        try {
            browserifyHooksFileStat = fs.statSync(browserifyHooksFilePath);
        } catch (error) {

        }

        if ((browserifyHooksFileStat instanceof fs.Stats) && browserifyHooksFileStat.isFile()) {
            BrowserifyHooks = require(bundlerPath + "BrowserifyHooks.js");
            browserifyHooks = new BrowserifyHooks(browserifyHooksFilePath, bundler);
            //Enable hooks like use or irgnore for Browserify-Bundler
            browserifyHooks.exec();
        }

    }

    //Create express-server
    simpleExpressServer = new SimpleExpressServer(testFolderPath, port);
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

    //Add some listeners to the socket.io-server
    socketIOServer.on("connect", function (socket) {

        socket.once("hello", function onHello(userAgentString) {

            var clientTest = new ClientTest(userAgentString, socket);

            function f5Emitter() {
                socket.emit("f5");
                console.info(
                    new Date().toLocaleTimeString() +
                    ": re-running tests on " + clientTest.getName() + " \n"
                );
            }

            console.info(
                new Date().toLocaleTimeString() + ": " +
                clientTest.getName() +
                " has connected \n"
            );

            clientTest.on("end", function onEnd() {
                var errors = clientTest.getErrors();

                console.info(clientTest.toString());
                if(errors) {
                    console.dir(errors);
                    console.log("\n");
                }
            });

            libDirMasterWatcher.on("change", f5Emitter);
            testDirMasterWatcher.on("change", f5Emitter);

            clientCollection.push({
                "socket": socket,
                "test": clientTest,
                "f5Emitter": f5Emitter
            });

            socket.emit("f5"); //run tests initially

        });

    });

    socketIOServer.on("reconnect", function (socket) {

        var client = _(clientCollection).find(function clientCollectionIterator(clientData) {
            return clientData.socket.id === socket.id;
        });

        console.info(
            new Date().toLocaleTimeString() + ": " +
            client.test.getName() +
            " has re-connected \n"
        );

    });

    socketIOServer.on("disconnect", function (socket) {

        var client = _(clientCollection).find(function clientCollectionIterator(clientData) {
            return clientData.socket === socket;
        });

        client.test.removeAllListeners();
        socket.removeAllListeners(); //@TODO This is the job of the SimpleSocketIOServer
        libDirMasterWatcher.removeListener("change", client.f5Emitter);
        testDirMasterWatcher.removeListener("change", client.f5Emitter);
        console.info(
            new Date().toLocaleTimeString() + ": " +
            client.test.getName() +
            " has dis-connected \n"
        );

    });

    socketIOServer.start();
}

exports.start = start;