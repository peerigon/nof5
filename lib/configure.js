"use strict";

var nconf = require("nconf"),
    fs = require("fs"),
    defaults = require("../defaultConfig.json");

module.exports = function configure() {

    var isModuleRootDir = false,
        files;

    function findPackageJSON(file, index) {
        if (file === "package.json") {
            isModuleRootDir = true;
        }
    }

    nconf
        .argv()
        .defaults(defaults)
        .defaults({
            "modulePath": process.cwd()
        });

    //Read files from given directory
    files = fs.readdirSync(nconf.get("modulePath"));
    files.forEach(findPackageJSON);

    //Check if directory is a module's root directory
    if (!isModuleRootDir) {
        throw new Error("package.json not found. You must execute nof5 within a module's root directory.");
    }

    return nconf;
};