"use strict";

var _ = require("underscore"),
    express = require("express"),
    fs = require("fs");

/**
 *
 * @param {string} testFolderPath
 * @param {Bundler} bundler
 * @param {number} port
 * @return {*}
 */
module.exports = function SimpleExpressServer(testFolderPath, port) {

    var __server,
        __getHandler = [];

    this.start = function () {

        __server = express.createServer();

        __server.configure(_configure);

        function getHandlerIterator(getHandler) {
            __server.get(getHandler.path, getHandler.middleware);
        }

        _(__getHandler).each(getHandlerIterator);

        //Start express-server
        __server.listen(port, function(){
            console.log("Tests are running at http://localhost:%d/", __server.address().port);
        });

        return __server;
    };

    /**
     * @param {string} path
     * @param {function} middleware
     *
     * @return {SimpleExpressServer}
     */
    this.get = function (path, middleware) {
        __getHandler.push({
            "path": path,
            "middleware": middleware
        });

        return this;
    };

    /**
     * @private
     */
    function _configure() {
        __server.use(express.static(testFolderPath));
    }

};