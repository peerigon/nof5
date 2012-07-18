(function (window) {
    "use strict";

    window.nof5 = window.nof5 || {};
    var nof5 = window.nof5,
        io = window.io;

    if (!io) {
        throw new Error(
            "(nof5) socket.io not found. " +
            "In order to use nof5 you must first include socket.io: " +
            "<script type='text/javascript' src='/socket.io/socket.io.js'></script>"
        );
    }

    /**
     * IMPORTANT INFO:
     * You can enable the tests with the magic method nof5.enableTests()
     */

    /**
     * Connect to server and configure socket
     */
    nof5.socket = io.connect(document.location.protocol + "//" + document.location.host, {
        "max reconnection attempts": 99999 //Infinity
    });

    /**
     * Contact automatically the server.
     */
    nof5.socket.on("connect", function onConnect() {
        nof5.socket.emit('hello', navigator.userAgent);
    });

})(window);