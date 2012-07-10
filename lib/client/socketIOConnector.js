(function (window) {
    "use strict";

    window.nof5 = window.nof5 || {};

    var nof5 = window.nof5,
        io = window.io;

    nof5.socket = io.connect(document.location.protocol + "//" + document.location.host);

    nof5.socket.on("connect", function onConnection() {

        nof5.socket.emit('hello', navigator.userAgent);

    });

    nof5.socket.on("f5", function reRunTests() {

        console.log("re-running tests");
        location.reload();

    });

})(window);