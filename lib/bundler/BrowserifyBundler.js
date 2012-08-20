"use strict";

var _ = require("underscore"),
    browserify = require("browserify");

function BrowserifyBundler() {

    var b,
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
        b = browserify( { "debug": true } );

        b.ignore(ignoreCollection);

        _(middlewareCollection).each(function middlewareCollectionIterator(middleware) {
            b.use(middleware);
        });

        _(testScripts).each(function testScriptsIterator(testScript) {
            b.addEntry(testScript);
        });

        return b.bundle();
    };
}

module.exports = BrowserifyBundler;