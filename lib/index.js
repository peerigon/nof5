"use strict";

var _ = require("underscore"),
    fs = require("fs"),
    nconf = require("nconf"),
    SimpleExpressServer = require("./SimpleExpressServer.js"),
    startSocketIOServer = require("./startSocketIOServer.js"),
    DirectoryMasterWatcher = require("./DirectoryMasterWatcher.js"),
    Bundler = require("./Bundler.js");


function start() {

    nconf.argv();

        //Server config
    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        testFolderPath = process.cwd(),
        libFolderPath = testFolderPath.replace("test", "lib"), //replace first occurrence of test in path with lib

        bundler = new Bundler(testFolderPath, useBrowserify),

        //Initialize (express- & socket.io-) servers
        simpleExpressServer = new SimpleExpressServer(testFolderPath, port),
        expressServer,
        socketIOServer,

        hooks,
        hooksPath = testFolderPath + "/nof5.hooks.js",
        hooksFileStat,

        f5Emitter = [],

        //Initialize watcher
        libDirMasterWatcher = new DirectoryMasterWatcher(),
        testDirMasterWatcher = new DirectoryMasterWatcher();

        testDirMasterWatcher.watch(testFolderPath);

    try {
        libDirMasterWatcher.watch(libFolderPath);
    } catch (error) {
        console.warn("(nof5) unable to resolve lib path. Assumed path to lib: " + libFolderPath, error.message);
    }

    try {
        hooksFileStat = fs.statSync(hooksPath);
        if (hooksFileStat.isFile()) {
            hooks = require(hooksPath);
        }
    } catch (error) {
        //@TODO
    }

    if (hooks && useBrowserify) {
        if (typeof hooks.browserifyMiddleware === "function") {
            bundler.useWithBrowserify(hooks.browserifyMiddleware());
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
    }

    function runHooks() {

        if (hooks) {

            if(typeof hooks.beforeEach === "function") {

                try {
                    hooks.beforeEach();
                } catch (err) {
                    //@TODO give some feedback if a hook fails.
                }

            }//endif

        }//endif

    }

    /**
     * @param {object} req
     * @param {object} res
     */
    function getTestsScriptMiddleware(req, res) {

        runHooks();

        res.header("Content-Type", "text/javascript");
        res.end(bundler.getTests());

    }

    simpleExpressServer.get("/tests.js", getTestsScriptMiddleware);

    //Create the expressServer
    expressServer = simpleExpressServer.start();

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

exports.start = start;