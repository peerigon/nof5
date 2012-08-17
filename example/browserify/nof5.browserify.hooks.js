"use strict";

var useExecuted = false,
    ignoreExecuted = false;

exports.use = function useHook() {

    useExecuted = true;

    return [
        function () {
            //Do nothing
        },
        function () {
            //Do nothing
        }
    ];
};

exports.isUseExecuted = function () {
    return useExecuted;
};

exports.ignore = function ignoreHook() {

    ignoreExecuted = true;

    return ["coffee-script"];
};

exports.isIgnoreExecuted = function () {
  return ignoreExecuted;
};