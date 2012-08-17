"use strict";

var webpack = require("webpack"),
    _ = require("underscore"),
    async = require("async");

/**
 * @constructor
 */
var WebpackBundler = function () {

    var options = {};

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

        var bundle = "";

        async.forEach(testScripts, function getWebpackBundle(testScript, done) {

            webpack(testScript , options, function webpackCallback(err, source) {

                if (err) {
                    throw err;
                }

                bundle += "\n" + source;

                done();
            });

        }, function _onBundled() {
            onBundled(bundle);
        });

    };

};

module.exports = WebpackBundler;