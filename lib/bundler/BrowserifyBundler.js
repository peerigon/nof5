"use strict";

var _ = require("underscore"),
    browserify = require("browserify"),
    EventEmitter = require("EventEmitter"),
    util = require("util");

function BrowserifyBundler() {

    EventEmitter.call(this);

    var self = this,
        b,
        middlewareCollection = [],
        ignoreCollection = [];

    /**
     * @param {function|array} middleware
     * @return {BrowserifyBundler}
     */
    this.use = function (middleware) {

        if(typeof middleware === "function") {
            middlewareCollection.push(middleware);
        }

        if(Array.isArray(middleware)) {
            middlewareCollection = middlewareCollection.concat(middleware);
        }

        return this;
    };

    /**
     * {string|array}
     * @return {BrowserifyBundler}
     */
    this.ignore = function (ignores) {

        if (typeof ignores === "string") {
            ignoreCollection.push(ignores);
        }

        if (Array.isArray(ignores)) {
            ignoreCollection = ignoreCollection.concat(ignores);
        }

        return this;
    };

    /**
     * @param {array} testScripts
     * @return {string}
     */
    this._get = function (testScripts) {

        var bundle;

        b = browserify( { "debug": true } );

        b.ignore(ignoreCollection);

        _(middlewareCollection).each(function middlewareCollectionIterator(middleware) {
            b.use(middleware);
        });

        _(testScripts).each(function testScriptsIterator(testScript) {
            b.addEntry(testScript);
        });

        bundle = b.bundle();

        self.emit("bundleReady", bundle);

        return bundle();
    };
}

util.inherits(BrowserifyBundler, EventEmitter);

module.exports = BrowserifyBundler;