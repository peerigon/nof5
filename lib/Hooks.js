"use strict";

var fs = require("fs");

/**
 * @constructor
 */
function Hooks() {

    var /**
         * @type {object}
         * @private
         */
        hooks,
        /**
         * @type {boolean}
         * @private
         */
        isBeforeDone;


    /**
     * @param {string} hookFilePath
     * @return {Hooks}
     */
    this.init = function (hookFilePath) {

        hooks = require(hookFilePath);

        return this;
    };

    /**
     * @return {Hooks}
     */
    this.exec = function () {

        if (!isBeforeDone && __isHook(hooks.before)) {
            hooks.before();
            isBeforeDone = true;
        }

        if(__isHook(hooks.beforeEach)) {
            hooks.beforeEach();
        }

        return this;

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

module.exports = Hooks;