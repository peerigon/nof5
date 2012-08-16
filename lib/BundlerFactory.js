"use strict";

var util = require("util"),
    path = require("path"),
    Finder = require("fshelpers").Finder;

/**
 * @constructor
 */
function BundlerFactory() {

    /**
     * Creates a new Bundler
     *
     * @param {string} bundlerPath
     * @param {string} testFolderPath
     * @return {function}
     */
    this.build = function (bundlerPath, testFolderPath) {

        var SuperBundler = require(bundlerPath);

        function NewBundler() {

            var finder = new Finder(),
                self = this;

            SuperBundler.call(this);

            if (typeof this._get !== "function") {
                throw new Error(
                    "(nof5) " + bundlerPath + "' is not a valid Bundler.' " +
                        "A valid Bundler must provide a function get() which returns a bundle type of string."
                );
            }

            this.get = function () {
                var bundle = self._get(__getTestScripts());

                if (typeof bundle !== "string") {
                    throw new Error(
                        "(nof5) get() of " + bundlerPath + " must return a string, but has type of" +
                            typeof bundle + " returned."
                    );
                }

                bundle =
                    "(function(window) {" +
                        "\n" +
                        "window.nof5 = window.nof5 || {};" +
                        "\n" +
                        "window.nof5.enableTests = function () {" +
                        bundle +
                        "}" +
                        "\n" +
                        "})(window)";

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
        }

        util.inherits(NewBundler, SuperBundler);

        return new NewBundler();
    };
}

module.exports = BundlerFactory;