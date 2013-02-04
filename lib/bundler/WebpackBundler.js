"use strict";

var EventEmitter = require("events").EventEmitter,
    util = require("util");

var webpack = require("webpack"),
    _ = require("underscore");

/**
 * @constructor
 */
var WebpackBundler = function () {

    EventEmitter.call(this);

    var self = this,
        options = {
        //This key must be created for storing special information needed by nof5
        nof5: {},

        output: "there.will.be.no.output.js",
        noWrite: true, //disables outputing in a file
        emitFile: function (filename, content) {
            bundle = content;
        },

        resolve: {
            loaders: []
        }
    },
    bundle;

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

        webpack(__dirname + "/webpackEntry.js", options, function onWebpackFinished(err, stats) {

            if (err) {
                throw err;
            }

            //Possible that there will be more errors in the array, but you have to fix them step by step.
            if(stats.errors.length !== 0) {
                throw stats.errors[0];
            }

            self.emit("bundleReady", bundle);

            onBundled(bundle);
        });
    };

};

util.inherits(WebpackBundler, EventEmitter);

module.exports = WebpackBundler;