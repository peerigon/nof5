"use strict";

var _ = require("underscore"),
    nconf = require("nconf"),
    fs = require("fs"),
    defaultConfig = require("../defaultConfig.json");

/**
 * Throws an Error if nof5 is not executed from a module's root dir.
 * Uses nconf to read and extend default config with given params.
 * A plain JavaScript with the config will be returned.
 *
 * @return {Object}
 */
module.exports = function getConfig() {

    var isModuleRootDir = false,
        tmpFiles,
        config = {};

    function findPackageJSON(file, index) {
        if (file === "package.json") {
            isModuleRootDir = true;
        }
    }

    nconf
        .argv()
        .defaults(_.extend(defaultConfig, { "modulePath": process.cwd() } ));

    //Read tmpFiles from given directory
    tmpFiles = fs.readdirSync(nconf.get("modulePath"));
    tmpFiles.forEach(findPackageJSON);

    //Check if directory is a module's root directory
    /*
    if (!isModuleRootDir) {
        throw new Error("package.json not found. You must execute nof5 within a module's root directory.");
    }
    */

    //Read each value from nconf and create config
    _(defaultConfig).forEach(function forEachDefaultConfig(value, key) {
        config[key] = nconf.get(key);
    });

    return config;
};