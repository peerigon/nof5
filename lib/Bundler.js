"use strict";

var _ = require("underscore"),
    Finder = require("fshelpers").Finder;

/**
 * @param {string} type Either a type provided by nof5 or a path to a custom bundler
 * @param {testFolderPath}
 * @constructor
 */
module.exports = function Bundler(bunderTypePath, testFolderPath) {

    var BundlerType = require(bunderTypePath),
        bundlerType = new BundlerType(),
        bundle,
        finder;

    if (typeof bundlerType.get !== "function") {
        throw new Error(
            "(nof5) Module on path '" + bunderTypePath + "' is not a valid Bundler.' " +
            "A valid Bundler must provide a function get() which returns a bundle type of string."
        );
    }

    finder = new Finder();

    /**
     * @return {string}
     */
    this.get = function () {

        bundle = bundlerType.get(__getTestScripts());

        if (typeof bundle !== "string") {
            throw new Error("(nof5) get() from " + bunderTypePath + " does not return a string.");
        }

        return bundle;
    };

    /**
     * Returns all files with '.test.js' as extension.
     *
     * @return {Array}
     * @private
     */
    function __getTestScripts() {

        var testScripts = [];

        finder.on("file", function onFile (file) {
            if (file.search(/\.test\.js/g) > -1) {
                testScripts.push(file);
            }
        });

        finder.walkSync(testFolderPath);
        finder.removeAllListeners("file");

        return testScripts;
    }

};