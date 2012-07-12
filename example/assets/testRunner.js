(function (window) {
    nof5.socket.on("connect", function onConnect() {

        jQuery(function onDomReady() {
            mocha.setup({
                ui:"bdd",
                globals: ["io"]
            });

            mocha.Runner.prototype.on("suite", function (suite) {
                if(suite.root) {
                    nof5.socket.emit("start", new Date());
                }
            });

            mocha.Runner.prototype.on("fail", function onFail(test) {
                mocha.Runner.prototype.once("test end", function () {
                    var error = {
                        "suite": test.parent.title,
                        "test": test.title,
                        "type": test.err.toString()
                    };

                    nof5.socket.emit("fail", error);
                });
            });

            mocha.Runner.prototype.on("suite end", function onSuiteEnd(suite) {
                if (suite.root) {
                    nof5.socket.emit("end", new Date());
                }
            });

            nof5.enableTests();

            mocha.run();

            //@TODO remove this hack

            var isRunning = false;

            nof5.socket.on("f5", function onf5() {
                if (!isRunning) {
                    isRunning = true;
                    var oldTests = jQuery("script[src='tests.js']");

                    if (oldTests.length !== 0) {
                        jQuery("script[src='tests.js']").remove();
                    }

                    jQuery.getScript("tests.js", function onTestsLoaded() {
                        jQuery("#mocha").empty();

                        nof5.enableTests();

                        mocha.run();
                    });
                }
            });
        });
    });
})(window);
