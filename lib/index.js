"use strict";

var _ = require("underscore"),
    getConfig = require("./getConfig.js"),
    getTestRunner = require("./getTestRunner.js"),
    startExpressServer = require("./startExpressServer.js"),
    startSocketIOServer = require("./startSocketIOServer.js"),
    DirectoryMasterWatcher = require("./DirectoryMasterWatcher.js");

function start() {

    var config = getConfig(),

        modulePath = config.modulePath,
        testRunnerSuite = config.testRunnerSuite,
        assertionSuitePath = config.assertionSuite,
        useBrowserify = config.useBrowserify,
        port = config.port,

        testRunner,
        expressServer,
        socketIOServer,

        dMaster = new DirectoryMasterWatcher(modulePath);

    /**
     * @param {*} socket
     */
    function onSocketConnect(socket) {

        function emitF5() {
            console.log("re-running tests");
            socket.emit("f5");
        }

        dMaster.addOnDirChange(emitF5);
    }

    /**
     * @param {*} socket
     */
    function onSocketDisconnect(socket) {
        console.log("disconnected");
    }

    function logWatchedDirectories() {

        var watchedDirs = dMaster.getWatchedDirectories();

        function log(dirPath) {
            console.log(dirPath);
        }

        _.each(watchedDirs, log);
    }

    console.log("\n");
    console.log("Watched direcotires: \n");
    logWatchedDirectories();
    console.log("\n");

    //Create the testRunner
    testRunner = getTestRunner(modulePath, testRunnerSuite, assertionSuitePath, useBrowserify);

    //Create the expressServer
    expressServer = startExpressServer.start(modulePath, testRunner, port);

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

exports.start = start;