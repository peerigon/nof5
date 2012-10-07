"use strict";

var _ = require("underscore"),
    express = require("express");

/**
 *
 * @param {string|array} staticFolders
 * @param {number} port
 * @return {*}
 */
module.exports = function SimpleExpressServer(staticFolders, port) {

    var __server,
        __getHandler = [];

    if (!Array.isArray(staticFolders)) {
        staticFolders = [staticFolders];
    }

    this.start = function () {

        __server = express.createServer();

        __server.configure(_configure);

        function getHandlerIterator(getHandler) {
            __server.get(getHandler.path, getHandler.middleware);
        }

        _(__getHandler).each(getHandlerIterator);

        //Start express-server
        __server.listen(port, function(){
            console.log(new Date().toLocaleTimeString() + " Tests are running at http://localhost:%d/", __server.address().port);
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
        _(staticFolders).each(function staticFoldersIterator(staticFolderPath) {
            __server.use(express.static(staticFolderPath));
        });
    }

};