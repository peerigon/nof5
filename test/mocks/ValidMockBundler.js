"use strict";

var testScripts;

function ValidMockBundler() {

    /**
     * @return {array}
     */
    this.getTestScripts = function () {
        return testScripts;
    };

    /**
     * @param {array} passedTestScripts
     * @return {string}
     */
    this.get = function (passedTestScripts) {
        testScripts = passedTestScripts;
        return "string";
    };
}

module.exports = ValidMockBundler;