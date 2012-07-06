"use strict";

exports.browserifyMiddleware = function () {
    return [function () {
        //console.log("browsierfyMiddleware 1");
    }, function () {
        //console.log("browsierfyMiddleware 2");
    }];
};

exports.beforeEach = function (callback) {
    if (typeof callback === "function") {
        callback();
    }

    //console.log("hook: beforeEach");
};