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
module.exports = function getTestRunner(modulePath, testRunnerSuite, assertionSuite, useBrowserify) {

    var bify,
        testDirPath = modulePath + "/test",
        template = testRunnerSuite + "TestRunner",
        bundleFiles,
        bundle;

    /**
     * Filters from given path all real files and returns them as an Array. Not real files are symlinks, folders etc..
     *
     * @param directoryPath
     * @return {Array}
     */
    function filterFiles(directoryPath) {

        var pendingFiles = fs.readdirSync(directoryPath),
            realFiles = [];

        function filter(fileName) {
            var fullFilePath = directoryPath + "/" + fileName;

            if(fs.statSync(fullFilePath).isFile()) {
                realFiles.push(fullFilePath);
            }
        }

        pendingFiles.forEach(filter);

        return realFiles;
    }

    //Read all files which are placed in test directory
    bundleFiles = filterFiles(testDirPath);

    if(useBrowserify) {
        //Initialize browserify
        bify = browserify();
        //Add tests for bundling
        bify.addEntry(bundleFiles[0]); //@TODO There is a problem bundling files given in an array
        //Create bundle
        bundle = bify.bundle();
    }

    return function testRunner(req, res) {
        res.render(template, {
            "useBrowserify": useBrowserify,
            "bundle": bundle,
            "assertionSuite": assertionSuite
        });
    };
};