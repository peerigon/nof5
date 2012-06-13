"use strict";

var getConfig = require("./getConfig.js"),
    getTestRunner = require("./getTestRunner.js"),
    startExpressServer = require("./startExpressServer.js"),
    startSocketIOServer = require("./startSocketIOServer.js"),
    nconf;

function start() {

    var config = getConfig(),
        modulePath = config.modulePath,
        testRunnerSuite = config.testRunnerSuite,
        assertionSuitePath = config.assertionSuite,
        useBrowserify = config.useBrowserify,
        port = config.port,
        testRunner,
        expressServer,
        socketIOServer;

    /**
     * @param {*} socket
     */
    function onSocketConnect(socket) {
        /*
        dir.on("testDirChange", function () {
            socket.emit("f5");
        });
        */
    }

    /**
     * @param {*} socket
     */
    function onSocketDisconnect(socket) {
        console.log("disconnected");
    }

    //Create the testRunner
    testRunner = getTestRunner(modulePath, testRunnerSuite, assertionSuitePath, useBrowserify);

    //Create the expressServer
    expressServer = startExpressServer.start(modulePath, testRunner, port);

    //Create the socketIOServer
    socketIOServer = startSocketIOServer.start(expressServer, onSocketConnect, onSocketDisconnect);
}

start();
//exports.start = start;