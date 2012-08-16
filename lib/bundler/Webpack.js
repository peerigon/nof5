"use strict";

var webpack = require("webpack"),
    _ = require("underscore");

/**
 * @param {string} testFolderPath
 * @constructor
 */
var WebpackBundler = function (testFolderPath) {

    var options = {};

    /**
     * @param {object} newOptions
     */
    this.use = function (newOptions) {
        options = _.extend(options, newOptions) ;
    };

    /**
     * @param {array} testScripts
     * @return {string}
     * @private
     */
    this._get = function (testScripts) {

        var bundle = "";

        _(testScripts).each(function getWebpackBundle(testScript) {
            webpack(testFolderPath + "/" + testScript , options, function webpackCallback(err, source) {
                if (err) {
                    throw err;
                }
                console.log(err, source);

                bundle += source;
            });
        });

        console.log(bundle);

        return bundle;

    };

};

module.exports = WebpackBundler;