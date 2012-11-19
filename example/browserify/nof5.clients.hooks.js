"use strict";

var useClientHookExecuted = false;

exports.use = function useClientHook() {

    useClientHookExecuted = true;

    var clients = [
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
        "Mozilla/5.0 (X11; Linux x86_64; rv:16.0) Gecko/20100101 Firefox/16.0"
    ];

    return clients;
};