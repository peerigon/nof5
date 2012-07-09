"use strict";

var Browersify = require("./Browserify.js");

function BrowserifyHooks(hookFilePath, browserifyBundler) {

    var hooks = require(hookFilePath);

    if ((browserifyBundler instanceof Browersify) === false) {
        throw new Error(
            "(nof5) BrowserifyHooks can only deal with Browserify-Bunder. " +
            "But anything different was given."
        );
    }

    this.exec = function () {

        if (__isHook(hooks.use)) {
            browserifyBundler.use(hooks.use());
        }

        if (__isHook(hooks.ignore)) {
            browserifyBundler.ignore(hooks.ignore());
        }
    };

    /**
     * @param {*} hook
     * @return {boolean}
     * @private
     */
    function __isHook(hook) {
        return typeof hook === "function";
    }
}

module.exports = BrowserifyHooks;