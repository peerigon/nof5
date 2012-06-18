var expect = require("expect.js"),
    path = require("path"),
    getTestRunner = require("../lib/getTestRunner.js");

describe("#getTestRunner", function () {

    var nof5ModuleRoot = path.resolve(__dirname + "/../"),
        testRunnerSuite = "mocha",
        assertionSuite = "expect.js",
        useBrowserifty = true;

    it("should return a test-runner or rather a function", function () {
        expect(getTestRunner(nof5ModuleRoot, testRunnerSuite, assertionSuite, useBrowserifty)).to.be.a(Function);
    });

    describe("#optional parameters", function () {
        it("should return a test-runner if no assertion-suite was definied", function () {
            expect(getTestRunner(nof5ModuleRoot, testRunnerSuite, undefined, useBrowserifty)).to.be.a(Function);
        });

        it("should return a test-runner if not specified to use browserify", function () {
            expect(getTestRunner(nof5ModuleRoot, testRunnerSuite, assertionSuite, undefined)).to.be.a(Function);
        });
    });
});