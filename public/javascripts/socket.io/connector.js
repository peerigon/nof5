"use strict";

(function (window) {
    var socket = io.connect("http://localhost");

    function reRunTests() {
        location.reload();
    }

    socket.on("f5", reRunTests)
    ;
})(window);

