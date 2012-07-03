"use strict";

exports.before = function (callback) {
    if (typeof callback === "function") {
        callback();
    }
};