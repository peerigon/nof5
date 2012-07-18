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
    this._get = function (passedTestScripts) {
        testScripts = passedTestScripts;
        return "string";
    };

    this.doNothing = function () {
        //should really do nothing
    };
}

module.exports = ValidMockBundler;