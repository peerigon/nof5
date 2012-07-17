(function (window) {
    "use strict";

    window.nof5 = window.nof5 || {};

    var nof5 = window.nof5,
        io = window.io;

    if (!nof5.socket) {

        nof5.socket = io.connect(document.location.protocol + "//" + document.location.host, {
            "max reconnection attempts": 99999 //Infinity
        });

        nof5.socket.on("connect", function onConnection() {
            nof5.socket.emit('hello', navigator.userAgent);
        });

    }

})(window);