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
    var config = new Config(),

        //(express- & socket.io-) servers
        staticFiles = [config.clientlib, config.test],
        simpleExpressServer,
        expressServer,
        socketIOServer,

        bundler,
        bundlerFactory = new BundlerFactory(),

        //Regular hooks
        hooks,

        //Webpack
        webpackHooks,

        //Browserify-only hooks
        BrowserifyHooks,
        browserifyHooks,

        //An array of user-agent strings that must finish the tests successfully to complete the whole test
        clients,

        clientCollection = [],

        //Initialize watcher
        libWatcher,
        testWatcher = new Watcher(config.test);

    if (config.debug === true) {
        console.info();
        console.info("Config:");
        console.info();
        console.info("debug:", config.debug);
        console.info("silent", config.silent);
        console.info("list", config.list);
        console.info("port:", config.port);
        console.info("test:", config.test);
        console.info("lib:", config.lib);
        console.info("bundler:", config.bundler);
        console.info("assets:", config.assets);
        console.info("hooks:", config.hooks);
        console.info("wphooks:", config.wphooks);
        console.info("bhooks:", config.bhooks);
        console.info("xunit-file:", config.xunit);
        console.info("clients:", config.clients);
        console.info();
    }

    //Print list of supported bundlers
    if (config.list) {
        console.info();
        console.info("Supported bundlers: ");
        console.info();
        _(config.supportedBundlers).each(function outputBundlerName(bundlerName) {
            console.info(bundlerName);
        });
        console.info();
        process.exit(0);
    }

    if (config.silent) {
        console.log = function () { /* The sound of silence */ };
    }

    //Assume path to lib/
    if (config.isLibFolder) {
        libWatcher = new Watcher(config.lib);
        if (config.debug) {
            console.info("(nof5) Watched dirs in lib:\n", libWatcher.getWatchedDirs(), "\n");
        }
    }

    //Init hooks
    if (config.isHooks) {
        hooks = new Hooks();
        hooks.init(config.hooks);
    }


    //Init Webpack-Bundler
    if (config.bundler.search(/webpack/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerlib + "/WebpackBundler.js", config.test);

        if (config.isWebpackHooks) {
            webpackHooks = require(config.wphooks);
            bundler.use(webpackHooks.use());

        }
    }

    //Init Browserify-Bundler
    if (config.bundler.search(/browserify/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerlib + "/BrowserifyBundler.js", config.test);

        if (config.isBrowserifyHooks) {
            BrowserifyHooks = require(config.bundlerlib + "/BrowserifyHooks.js");
            browserifyHooks = new BrowserifyHooks(config.bhooks, bundler);
            //Enable hooks like use or irgnore for Browserify-Bundler
            browserifyHooks.exec();
        }

    }

    //Init simple NOF5-Bundler
    if (config.bundler.search(/nof5/i) === 0) {
        bundler = bundlerFactory.build(config.bundlerlib + "/NOF5Bundler.js", config.test);
    }

    //Add user defined assets folder
    if (config.isAssetsFolder) {
        staticFiles.push(config.assets);
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

    if (config.isLibFolder) {
        libWatcher.on("change", onDirChange);
    }
    testWatcher.on("change", onDirChange);

    //Load clients hook
    if(config.isClientsHook) {
        clients = require(config.clients).use();
    }

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
                
                if(config.writeXUnitFile) {
                    var filePath = path.resolve(config.xunit, 'xunit.xml'),
                        fd = fs.openSync(filePath, 'w'); 
                        
                    fs.writeSync(fd, this.getErrorsXUnit(), null, 'utf8');
                    fs.closeSync(fd);
                }

                if(config.isClientsHook) {
                    clients.splice(clients.indexOf(userAgentString),1);

                    if (clients.length === 0) {
                        console.log("All clients connected");
                        // all clients connected
                    }
                }
            });

            if (config.isLibFolder) {
                libWatcher.on("change", f5Emitter);
            }
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

        if (config.isLibFolder) {
            libWatcher.removeListener("change", client.f5Emitter);
        }

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
