"use strict";

var useClientHookExecuted = false;

exports.use = function useClientHook() {

    useClientHookExecuted = true;

    var clients = ["Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19" +
            " (KHTML, like Gecko) Ubuntu/12.04 Chromium/18.0.1025.168 Chrome/18.0.1025.168 Safari/535.19"];

    return clients;
};