(function (window) {
    "use strict";

    window.nof5 = window.nof5 || {};
    var nof5 = window.nof5,
        io = window.io;

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

    nof5.errorData = function () {

        var __suite = "",
            __test = "",
            __err = null,
            __stack = null,
            self = this;

        /**
         * @param {function} suite
         * @retun {nof5.errorData}
         */
        this.setSuite = function (suite) {
            self.__suite = suite;
            return self;
        };

        /**
         * @param {function} test
         * @return {nof5.errorData}
         */
        this.setTest = function (test) {
            self.__test = test;
            return self;
        };

        /**
         * @param {Error} error
         * @return {nof5.errorData}
         */
        this.setError = function (error) {
            self.__err = error;

            if (error.stack) {
                self.__stack = error.stack;
            }

            return self;
        };

        /**
         * @return {object}
         */
        this.toJSON = function () {
            return {
                "suite": self.__suite,
                "test": self.__test,
                "err": self.__err.toString(),
                "stack": self.__stack
            };
        };

    };

})(window);