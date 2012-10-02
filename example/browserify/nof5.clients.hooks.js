"use strict";

var useClientHookExecuted = false;

exports.use = function useClientHook() {

    useClientHookExecuted = true;

    var clients = ["Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) " +
            "Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47 Safari/536.11"];

    return clients;
};