"use strict";

var _ = require("underscore");

function webpackLoader() {
    var testScripts = this.options.nof5.testScripts,
        src = "";

    _(testScripts).each(function eachTestScript(testScript) {
        src += 'require("' + testScript + '");\n';
    });

    return src;
}


webpackLoader.loader = __filename;
webpackLoader.test = /webpackEntry\.js$/;

module.exports = webpackLoader;