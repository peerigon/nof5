"use strict";

(function (window) {
    var socket = io.connect("http://localhost");

    function reRunTests() {
        console.log("re-running tests");
        location.reload();
    }

    socket.on("f5", reRunTests)
    ;
})(window);

