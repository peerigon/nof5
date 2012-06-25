"use strict";

var path = require("path"),
    fs = require("fs"),
    _ = require("underscore"),
    browserify = require("browserify");

/**
 * @param {string} testFolderPath
 * @param {boolean} useBrowserify
 */
module.exports = function TestFileBundler(testFolderPath, useBrowserify) {

    var b,
        socketIOConnectorPath = __dirname + "/socketIOConnector.js";

    /**
     * Creates a new browserify instance and overrides the old one.
     * @private
     */
    function __initBrowserify () {

        b = browserify({
            "debug": true
        });

        b.ignore("coffee-script");

        b.addEntry(socketIOConnectorPath);
    }

    /**
     * Returns an array including only name of files (and not e.g. directories).
     *
     * @param {string }directoryPath
     * @return {array}
     * @private
     */
    function __filterFiles(directoryPath) {

        var pendingFiles = fs.readdirSync(directoryPath),
            onlyFiles = [];

        function filter(file) {
            var fullFilePath = directoryPath + "/" + file;

            if(fs.statSync(fullFilePath).isFile() && path.extname(file) === ".js") {
                onlyFiles.push(file);
            }
        }

        pendingFiles.forEach(filter);

        return onlyFiles;
    }

    /**
     * Creates a bundle using browserify
     *
     * @param {array} testFiles
     * @return {string}
     * @private
     */
    function __browserify(testFiles) {

        __initBrowserify();

        /**
         * @param {string} testFilename
         * @private
         */
        function __testFileIterator(testFilename) {
            //browserify needs the full path of each test
            b.addEntry(testFolderPath + "/" + testFilename);

        }

        _(testFiles).each(__testFileIterator);

        //Create bundle
        return b.bundle();
    }

    /**
     * @param {array} testFiles
     * @return {string}
     * @private
     */
    function __createBundle(testFiles) {

        var bundle = "",
            sockeetIOConnectorSrc;

        /**
         * @param {string} filePath
         * @return {string}
         * @private
         */
        function __readFileContent(filePath) {

            var fileContent = fs.readFileSync(filePath, "utf8");

            fileContent = fileContent
                .replace(/\r?\n/g, "\\\\n")  // escape all line breaks
                .replace(/'/g, "\\'");      // escape all string delimiters

            return fileContent;
        }

        /**
         * @param {string} fileContent
         * @return {string}
         * @private
         */
        function __wrapFileContent(fileContent, filename) {
            return " eval(' (function () {\\n " + fileContent + " \\n})(); //@ sourceURL=" + filename + "'); "
        }

        /**
         * @param {string} filename
         * @private
         */
        function __createBundleIterator(filename) {

            var fileContent = __readFileContent(testFolderPath + "/" + filename);

            bundle += __wrapFileContent(fileContent, filename);
        }

        //Add socketIOConnector
        sockeetIOConnectorSrc = __wrapFileContent(__readFileContent(socketIOConnectorPath), "socketIOConnector.js");


        bundle += sockeetIOConnectorSrc ;

        _(testFiles).each(__createBundleIterator);

        return bundle;

    }

    /**
     * @return {string}
     */
    this.getTests = function () {
        //Read all files located in given test folder
        var testFiles = __filterFiles(testFolderPath);

        if (useBrowserify) {
            return __browserify(testFiles);
        } else {
            return __createBundle(testFiles);
        }
    };

};