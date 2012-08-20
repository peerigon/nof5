"use strict";

var webpack = require("webpack"),
    _ = require("underscore");

/**
 * @constructor
 */
var WebpackBundler = function () {

    var options = {
        nof5: {

        },
        resolve: {
            loaders: []
        }
    };

    /**
     * @param {object} newOptions
     */
    this.use = function (newOptions) {
        options = _.extend(options, newOptions) ;
    };

    /**
     * @param {array.<string>} testScripts
     * @param {function(string)} onBundled
     * @return {string}
     * @private
     */
    this._get = function (testScripts, onBundled) {

        //@see /lib/bundler/webpackLoader.js
        options.nof5.testScripts = testScripts;
        options.resolve.loaders.push(require("./webpackLoader.js"));

        webpack(__dirname + "/webpackEntry.js", options, function onWebpackFinished(err, source) {
            onBundled(source);
        });
    };

};

module.exports = WebpackBundler;