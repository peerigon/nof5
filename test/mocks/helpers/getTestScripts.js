"use strict";

var Finder = require("fshelpers").Finder,
    finder = new Finder();

/**
 * @param {string} folder
 * @return {Array}
 */
module.exports = function getTestScripts(folder) {

    var testScripts = [];

    finder.on("file", function onFile (file) {
        if (file.search(/\.test\.js/g) > -1) {
            testScripts.push(file);
        }
    });

    finder.walkSync(folder);
    finder.removeAllListeners("file");

    return testScripts;
};