"use strict";

var express = require("express"),
    fs = require("fs");

/**
 *
 * @param {string} testFolderPath
 * @param {Bundler} bundler
 * @param {number} port
 * @return {*}
 */
module.exports = function ExpressServer(testFolderPath, bundler, port) {

    var server;

    this.start = function () {

        server = express.createServer();

        server.configure(_configure);

        server.get("/tests.js", __getTestsScript);

        //Start express-server
        server.listen(port, function(){
            console.log("Tests are running at http://localhost:%d/", server.address().port);
        });

        return server;
    };

    /**
     * express-middleware
     *
     * @param {object} req
     * @param {object} res
     * @private
     */
    function __getTestsScript(req, res) {

        res.header("Content-Type", "text/javascript");
        res.end(bundler.getTests());

    }

    /**
     * @private
     */
    function _configure() {
        server.use(express.static(testFolderPath));
    }

};