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

        //Ser config
    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        testFolderPath = process.cwd(),

        bundler = new Bundler(testFolderPath, useBrowserify),

        //Initialize (express- & socket.io-) servers
        simpleExpressServer = new SimpleExpressServer(testFolderPath, port),
        expressServer,
        socketIOServer,

        hooks,
        hooksPath = testFolderPath + "/nof5.hooks.js",

        f5Emitter = [],

        //Initialize watcher
        dirMasterWatcher = new DirectoryMasterWatcher();
        dirMasterWatcher.watch(testFolderPath);


    /**
     * @param {*} socket
     * @return {Function}
     */
    function getNewChangeListener(socket) {

        return function emitF5() {
            var date = new Date();

            console.log(date.getHours() + ":" + date.getMinutes() + "_" + date.getSeconds() + " - re-running tests");

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

        dirMasterWatcher.on("change", newChangeListener);
    }

    /**
     * @param {object} socket
     */
    function onSocketDisconnect(socket) {
        //Get the change listener
        var listener = getF5EmitterCallback(socket);

        dirMasterWatcher.removeListener("change", listener);
    }

    /**
     * @param {object} req
     * @param {object} res
     */
    function getTestsScriptMiddleware(req, res) {

        fs.stat(hooksPath, function (error, stat) {

            if (!error && stat.isFile()) {

                hooks = require(hooksPath);

                if(typeof hooks.before === "function") {
                    hooks.before(req, res);
                }
            }

            res.header("Content-Type", "text/javascript");
            res.end(bundler.getTests());

        });

    }

    simpleExpressServer.get("/tests.js", getTestsScriptMiddleware);

    //Create the expressServer
    expressServer = simpleExpressServer.start();

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

exports.start = start;