"use strict";

var _ = require("underscore"),
    path = require("path"),
    fs = require("fs");

var userAgentParser = require("useragent");

var SimpleExpressServer = require("./SimpleExpressServer.js"),
    SimpleSocketServer = require("./SimpleSocketIOServer.js");

var Watcher = require("./Watcher.js");

var Hooks = require("./Hooks.js");
var BundlerFactory = require("./BundlerFactory.js");

var ClientTest = require("./ClientTest.js"),
    jade = require("jade");

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
        bundle,

        //Regular hooks
        hooks,

        //Webpack
        webpackHooks,

        //Browserify-only hooks
        BrowserifyHooks,
        browserifyHooks,

        //An array of user-agent strings that must finish the tests successfully to complete the whole test
        clients,
        allClientsTimeout = 300000, // 5 Minutes as workaround for slow mocha reporter on mobile devices

        clientCollection = [],

        //Initialize watcher
        libWatcher,
        testWatcher = new Watcher(config.test);

    function createBundle() {

        if (hooks) {
            hooks.exec();
        }

        bundler.get(function onTestsBundled(tests) {

            bundle = tests;

        });

    }

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

    createBundle();
    testWatcher.on("change", createBundle);
    if (config.isLibFolder) {
        libWatcher.on("change", createBundle);
    }

    //Create express-server
    simpleExpressServer = new SimpleExpressServer(staticFiles, config.port);
    //Config
    simpleExpressServer.get("/tests.js", function getTestScripts(req, res) {

        res.header("Content-Type", "text/javascript");

        // check if bundle creation is finished
        if (bundle) {

            res.end(bundle);

        // else wait for
        } else {

            bundler.on("bundleReady", function onBundleReady(bundle) {

                res.end(bundle);

            });

        }

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

        _(clients).each(function printExpectedUserAgent(expectedUserAgent) {

            console.log(
                "expecting " + expectedUserAgent.family +
                " " + expectedUserAgent.major +
                " for " + expectedUserAgent.os + " to connect."
            );

        });

    }

    if(config.writeXUnitFile) {
        var filePath = path.resolve(config.xunit, 'xunit.xml'),
            fd = fs.openSync(filePath, 'w'),
            clientErrors = [];

        //@TODO clean up
        setInterval(function waitOnAllClients() {

            console.log((allClientsTimeout / 1000) + " sec has elapsed, but not all expected clients has connected.");
            console.log("closing nof5 now");

            _(clients).each(function createError(expectedUserAgent) {

                clientErrors.push(new ClientTest(expectedUserAgent).addError({

                    "suite": "not connected / timeout",
                    "test": "not connected / timeout",
                    "type": "timeout",
                    "stack": null,
                    "state": null

                }));

            });

            writeXUnitFile();

            process.exit(0);

        }, allClientsTimeout); // 180 seconds
    }

    // @TODO make a class out of this
    function writeXUnitFile() {

        fs.writeSync(fd, '<testsuite name="Mocha Tests" errors="' + clientErrors.length + '" timestamp="Thu, 30 Aug 2012 14:35:17 GMT">', null, 'utf8');
        var i;
        for (i = 0; i < clientErrors.length; i++) {
            fs.writeSync(fd, clientErrors[i], null, 'utf8');
        }
        fs.writeSync(fd, '</testsuite>', null, 'utf8');
        fs.closeSync(fd);
    }

    //Add some listeners to the socket.io-server
    socketIOServer.on("connect", function (socket) {

        socket.once("hello", function onHello(userAgentString) {

            // @TODO clean up
            var clientTest = new ClientTest(userAgentString, socket),
                hasResponded = false,
                responseTimeOut = 120000,
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
                if (errors) {
                    _(errors).each(function printError(err) {
                        console.log("\x1B[90m%s\x1B[39m", err.client);
                        console.log("\x1B[1m%s\x1B[22m", err.suite);
                        console.log("\x1B[90m%s\x1B[39m", err.stack);
                        console.log("\n---------------------------------------------------------------------------------------\n");
                    });
                }

                if (config.writeXUnitFile && config.isClientsHook) {

                    clientErrors.push(this.getErrorsXUnit());

                    _(clients).find(function checkUserAgent(expectedUserAgent, index) {

                        var userAgent = userAgentParser.parse(userAgentString);

                        if (
                            userAgent.os.toUpperCase() === expectedUserAgent.os.toUpperCase() &&
                            userAgent.family.toUpperCase() === expectedUserAgent.family.toUpperCase() &&
                            parseInt(userAgent.major) === expectedUserAgent.major
                        ) {

                            clients.splice(index, 1);

                            return true;

                        }

                    });


                    if (clients.length === 0) {

                        console.log(new Date().toLocaleTimeString() + " All expected browser connected. Closing server now.");

                        if (config.writeXUnitFile) {

                            writeXUnitFile();

                        }

                        process.exit(0);
                    }
                }
            });

            bundler.on("bundleReady", f5Emitter);
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

        bundler.removeListener("change", client.f5Emitter);
        console.info(
            new Date().toLocaleTimeString() + " " +
            client.test.getName() +
            " has dis-connected \n"
        );

    });

    socketIOServer.start();
}

exports.start = start;
