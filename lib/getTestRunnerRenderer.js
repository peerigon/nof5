"use strict";

var fs = require("fs"),
    browserify = require("browserify");

/**
 * @param {String} modulePath
 * @param {String} testRunnerSuite
 * @param {String} assertionSuite
 * @param {Boolean} useBrowserify
 * @return {Function} testRunner
 */
module.exports = function getTestRunnerRenderer(modulePath, testRunnerSuite, assertionSuite, useBrowserify) {

    var bify,
        testDirPath = modulePath /*+ "/test/"*/,
        view = testRunnerSuite + "TestRunner",
        bundleFiles,
        bundle;

    /**
     * Filters from given path all real files and returns them as an Array. Not real files are symlinks, folders etc..
     *
     * @param directoryPath
     * @return {Array}
     *
     */
    function filterFiles(directoryPath) { //@TODO Make a lib out of this function

        var pendingFiles = fs.readdirSync(directoryPath),
            realFiles = [];

        function filter(file) {
            var fullFilePath = directoryPath + file;

            if(fs.statSync(fullFilePath).isFile()) {
                realFiles.push(file);
            }
        }

        pendingFiles.forEach(filter);

        return realFiles;
    }

    //Read all files which are placed in test directory
    bundleFiles = filterFiles(testDirPath);

    function getBundle() {
        if(!useBrowserify) {
            bundle = bundleFiles;
        } else {
            //Initialize browserify
            bify = browserify({
                "debug": true
            });

            //Add tests for bundling
            bundleFiles.forEach(function(file) {
                //browserify needs the full path of each file
                bify.addEntry(testDirPath + file);
            });
            //Create bundle
            bundle = bify.bundle();
        }

        return bundle;
    }

    return function testRunnerRenderer(req, res) {
        res.render(view, {
            "useBrowserify": useBrowserify,
            "bundle": getBundle(),
            "assertionSuite": assertionSuite
        });
    };
};