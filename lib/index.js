"use strict";

var _ = require("underscore"),
    //getConfig = require("./getConfig.js"),
    nconf = require("nconf"),
    startExpressServer = require("./startExpressServer.js"),
    startSocketIOServer = require("./startSocketIOServer.js"),
    DirectoryMasterWatcher = require("./DirectoryMasterWatcher.js"),
    Bundler = require("./Bundler.js");

function start() {

    nconf.argv();

    var port = nconf.get("port") || 11234,

        useBrowserify = (nconf.get("nobrowserify")) ? false : true,
        testFolderPath = process.cwd(),

        bundler = new Bundler(testFolderPath, useBrowserify),

        expressServer,
        socketIOServer,

        f5Emitter = [],

        dMaster = new DirectoryMasterWatcher();
        dMaster.watch(testFolderPath);

    /**
     * @param {*} socket
     * @return {Function}
     */
    function getNewChangeListener(socket) {
        return function emitF5() {
            console.log("re-running tests");
            socket.emit("f5");
        };
    }

    /**
     * @param {*} socket
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
     * @param {*} socket
     */
    function onSocketConnect(socket) {

        var newChangeListener = getNewChangeListener(socket);

        f5Emitter.push({
            "socket": socket,
            "callback": newChangeListener //Get for each new connection a new listener for "change"-Event.
        });

        dMaster.on("change", newChangeListener);
    }

    /**
     * @param {*} socket
     */
    function onSocketDisconnect(socket) {
        //Get the change listener
        var listener = getF5EmitterCallback(socket);

        dMaster.removeListener("change", listener);
    }

    //Create the expressServer
    expressServer = startExpressServer.start(testFolderPath, bundler, port);

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

exports.start = start;