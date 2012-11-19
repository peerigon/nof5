"use strict";

var _ = require("underscore"),
    fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    util = require("util");

function NOF5Bundler() {

    EventEmitter.call(this);

    var self = this;

    this._get = function (testScripts) {

        var bundle = "";

        _(testScripts).each(function testScriptsIterator(testScript) {

            var testScriptContent = __readTestScript(testScript);

            bundle = bundle + __makeTestScriptSelfExecuting(testScriptContent, testScript);

            bundle += __readTestScript(testScript);
        });

        self.emit("bundleReady", bundle);

        return bundle;
    };

    function __readTestScript(testScript) {

        var testScriptContent = fs.readFileSync(testScript, "utf8");

        testScriptContent = testScriptContent
            //Escape all line breaks.
            .replace(/\r?\n/g, "\\\\n")
            //Escape all string delimiters
            .replace(/'/g, "\\'");

        return testScriptContent;
    }

    function __makeTestScriptSelfExecuting(testScriptContent, testScript) {
        return (
            " eval(' " +

                "(function () { \\n" +

                    testScriptContent + "\\n" +

                "})(); //@ sourceURL=" + testScript +

            "'); "
        );
    }

}

util.inherits(NOF5Bundler, EventEmitter);

module.exports = NOF5Bundler;