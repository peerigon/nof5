"use strict";

var _ = require("underscore"),
    fs = require("fs");

var nconf = require("nconf");

var SimpleExpressServer = require("./SimpleExpressServer.js"),
    startSocketIOServer = require("./startSocketIOServer.js");

var DirectoryMasterWatcher = require("./DirectoryMasterWatcher.js");

var Hooks = require("./Hooks.js");

var Bundler = require("./Bundler.js");


function start() {

    nconf.argv();

        //Server config
    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        testFolderPath = process.cwd(),
        libFolderPath = testFolderPath.replace("test", "lib"), //replace first occurrence of test in path with lib

        //Initialize (express- & socket.io-) servers
        simpleExpressServer = new SimpleExpressServer(testFolderPath, port),
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

        f5Emitter = [],

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

    /**
     * @param {*} socket
     * @return {Function}
     */
    function getNewChangeListener(socket) {

        return function emitF5() {
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds();

            if(hours < 10) { hours = "0" + hours; }
            if(minutes < 10) { minutes = "0" + minutes; }
            if(seconds < 10 ) {seconds = 0 + seconds; }

            console.log(hours + ":" + minutes + ":" + seconds + " - re-running tests");

            socket.emit("f5");
        };
    }

    /**
     * @param {object} socket
     * @return {Object}
     */
    function getF5EmitterCallback(socket) {

        var emitterData;

        function iterator(object) {
            return (object.socket = socket);
        }

        emitterData = _(f5Emitter).find(iterator);
        return emitterData.callback;
    }

    /**
     * @param {object} socket
     */
    function onSocketConnect(socket) {

        var newChangeListener = getNewChangeListener(socket);

        console.log(socket);

        socket.on("hello", function onHello(userAgent) {
            console.log("\n");
            socket.userAgent = userAgent;
            console.info("Say hello to: ", socket.userAgent);
        });

        socket.on("fail", function (Error) {
            console.log("\n");
            console.error("Test failed on: ", socket.userAgent, "with Error: ", Error);
        });

        socket.on("suite end", function () {
            console.log("\n");
            console.info("suite end", socket.userAgent);
        });

        f5Emitter.push({
            "socket": socket,
            "callback": newChangeListener //Get for each new connection a new listener for "change"-Event.
        });

        testDirMasterWatcher.on("change", newChangeListener);
        libDirMasterWatcher.on("change", newChangeListener);
    }

    /**
     * @param {object} socket
     */
    function onSocketDisconnect(socket) {
        //Get the change listener
        var listener = getF5EmitterCallback(socket);

        testDirMasterWatcher.removeListener("change", listener);
        libDirMasterWatcher.removeListener("change", listener);

        console.info("Say bye to: ", socket.userAgent);
    }

    /**
     * @param {object} req
     * @param {object} res
     */
    function getTestsScriptMiddleware(req, res) {

        hooks.exec();

        res.header("Content-Type", "text/javascript");
        res.end(bundler.get());

    }

    simpleExpressServer.get("/tests.js", getTestsScriptMiddleware);

    //Create the expressServer
    expressServer = simpleExpressServer.start();

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

exports.start = start;