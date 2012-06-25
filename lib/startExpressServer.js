"use strict";

var express = require("express"),
    getTests = require("./Bundler.js"),
    fs = require("fs");

/**
 *
 * @param {string} testFolderPath
 * @param {Bundler} bundler
 * @param {number} port
 * @return {*}
 */
function start(testFolderPath, bundler, port) {

    var server = express.createServer();

    function configure() {
        server.use(express.static(testFolderPath));
    }

    function getTestsScript(req, res) {

        res.header("Content-Type", "text/javascript");
        res.end(bundler.getTests());

    }

    // Configure express app
    server.configure(configure);

    server.get("/tests.js", getTestsScript);

    //Start express-server
    server.listen(port, function(){
        console.log("Tests are running at http://localhost:%d/", server.address().port);
    });

    return server;
}

exports.start = start;