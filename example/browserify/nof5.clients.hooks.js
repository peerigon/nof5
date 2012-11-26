"use strict";

var useClientHookExecuted = false;

exports.use = function useClientHook() {

    useClientHookExecuted = true;

    var clients = [{
            family: "Chrome",
            major: 23,
            os: "Linux"
        }, {
            family: "Firefox",
            major: 17,
            os: "Ubuntu"
        }];

    return clients;
};