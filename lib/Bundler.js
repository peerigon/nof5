"use strict";

/**
 * @param {string} type Either a type provided by nof5 or a path to a custom bundler
 * @constructor
 */
module.exports = function Bundler(bunderTypePath) {

    var BundlerType = require(bunderTypePath),
        bundler = new BundlerType(),
        bundle;

    if (typeof bundler.get !== "function") {
        throw new Error(
            "(nof5) Module on path '" + bunderTypePath + "' is not a valid Bundler.' " +
            "A valid Bundler must provide a function get() which returns a bundle type of string."
        );
    }

    /**
     * @return {string}
     */
    this.getBundle = function () {

        bundle = bundler.getBundle();

        if (typeof bundle !== "string") {
            throw new Error("(nof5) get() from " + bunderTypePath + " does not return a string.");
        }

        return bundler.getBundle();
    };

};