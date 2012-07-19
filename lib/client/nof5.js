(function (window) {
    "use strict";

    window.nof5 = window.nof5 || {};
    var nof5 = window.nof5,
        io = window.io;

    /**
     * IMPORTANT INFO:
     * You can enable the tests with the magic method nof5.enableTests()
     */
    nof5.connect = function(onConnect) {

        if (!io) {
            throw new Error(
                "(nof5) socket.io not found. " +
                    "In order to use nof5 you must first include socket.io: " +
                    "<script type='text/javascript' src='/socket.io/socket.io.js'></script>"
            );
        }

        /**
         * Connect to server and configure socket
         */
        nof5.socket = io.connect(document.location.protocol + "//" + document.location.host, {
            "max reconnection attempts": 99999 //Infinity
        });

        /**
         * Contact automatically the server.
         */
        nof5.socket.on("connect", function sayHello() {
            nof5.socket.emit('hello', navigator.userAgent);

            if (typeof onConnect === "function") {
                onConnect(nof5.socket);
            }

        });

        return nof5.socket;
    };

})(window);