"use strict";

var _ = require("underscore"),
    path = require("path"),
    fs = require("fs");

var SimpleExpressServer = require("./SimpleExpressServer.js"),
    SimpleSocketServer = require("./SimpleSocketIOServer.js");

var Watcher = require("./Watcher.js");

var Hooks = require("./Hooks.js");
var BundlerFactory = require("./BundlerFactory.js");

var ClientTest = require("./ClientTest.js");

var useragent = require("useragent");

var Config = require("./Config.js");

function start() {

        //Server config
    var config = new Config().toJSON(),

        //(express- & socket.io-) servers
        staticFiles = [config.clientFolder, config.testFolder],
        simpleExpressServer,
        expressServer,
        socketIOServer,

        bundler,
        bundlerFactory = new BundlerFactory(),

        //Regular hooks
        hooks,
        hooksFileStat,

        //Webpack
        webpackHooks,
        webpackHooksFileStat,

        //Browserify-only hooks
        BrowserifyHooks,
        browserifyHooks,
        browserifyHooksFileStat,

        clientCollection = [],

        //Initialize watcher
        libWatcher,
        testWatcher = new Watcher(config.testFolder);

    //Assume path to lib/
    try {
        libWatcher = new Watcher(config.libFolder);
    } catch (error) {
        console.warn("(nof5) unable to resolve lib path. Assumed path to lib: " + config.libFolder, error.message);
    }

    //Init hooks
    try {
        hooksFileStat = fs.statSync(config.hooksFile);
    } catch (err) {
        //console.info("(nof5) hooks file not defined");
    }

    if (hooksFileStat instanceof fs.Stats && hooksFileStat.isFile()){
        hooks = new Hooks();
        hooks.init(config.hooksFile);
    }

    //Init webpack-Bundler
    if (config.bundlerName.search(/webpack/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerFolder + "Webpack.js", config.testFolder);

        try {
            webpackHooksFileStat = fs.statSync(config.webpackHooksFile);
        } catch (error) {
            console.error(error);
        }

        if ((webpackHooksFileStat instanceof fs.Stats) && webpackHooksFileStat.isFile()) {
            webpackHooks = require(config.webpackHooksFile);
            bundler.use(webpackHooks.use());
        }
    }

    //Init Browsierfy-Bundler
    if (config.bundlerName.search(/browserify/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerFolder + "Browserify.js", config.testFolder);

        try {
            browserifyHooksFileStat = fs.statSync(config.browserifyHooksFile);
        } catch (error) {
            console.error(error);
        }

        if ((browserifyHooksFileStat instanceof fs.Stats) && browserifyHooksFileStat.isFile()) {
            BrowserifyHooks = require(config.bundlerFolder + "BrowserifyHooks.js");
            browserifyHooks = new BrowserifyHooks(config.browserifyHooksFile, bundler);
            //Enable hooks like use or irgnore for Browserify-Bundler
            browserifyHooks.exec();
        }

    }

    //Init simple NOF5-Bundler
    if (config.bundlerName.search(/nof5/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerFolder + "NOF5.js", config.testFolder);
    }

    //Add user defined assets folder
    if (config.assetsFolder) {
        staticFiles.push(config.assetsFolder);
    }

    //Create express-server
    simpleExpressServer = new SimpleExpressServer(staticFiles, config.port);
    //Config
    simpleExpressServer.get("/tests.js", function getTestScripts(req, res) {

        if (hooks) {
            hooks.exec();
        }

        bundler.get(function onTestsBundled(tests) {
            res.header("Content-Type", "text/javascript");
            res.end(tests);
        });

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
