//@TODO Catch errors on hooks
(function (window) {
    "use strict";

    var nof5 = window.nof5,
        mocha = window.mocha;

    jQuery(function onReady() {

        nof5.connect(function onConnect(socket) {

            var suites = [];

            mocha.setup({
                ui:"bdd",
                globals: [
                    "io",
                    "getInterface", //getInterface seems to be a global function from mocha ^^
                    "stats",
                    "report"
                ]
            });

            mocha.Runner.prototype.on("suite", function (suite) {
                if(suite.root) {
                    socket.emit("start", new Date());
                }
                
                if(suite.title !== "") {
                    suites.push(suite.title);
                }
            });
            
            

            mocha.Runner.prototype.on("fail", function onFail(test) {

                mocha.Runner.prototype.once("test end", function onTestEnd() {

                    var error = {
                        "suite": suites,
                        "test": test.title,
                        "type": test.err.toString()
                    };

                    socket.emit("fail", error);
                });
            });

            mocha.Runner.prototype.on("suite end", function onSuiteEnd(suite) {
                if (suite.root) {
                    suites = [];
                    socket.emit("end", new Date());
                    mocha.Runner.prototype.removeAllListeners("test end");
                }
            });

            socket.on("disconnect", function onDisconnect() {
                mocha.Runner.prototype.removeAllListeners();
            });

            socket.once("f5", function onf5() {
                location.reload();
            });

            nof5.enableTests();
            mocha.run();
        });
    });

})(window);
