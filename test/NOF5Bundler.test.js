"use strict";

var _ = require("underscore"),

    path = require("path"),
    EventEmitter = require("events").EventEmitter,

    expect = require("expect.js"),

    getTestScripts = require("./mocks/helpers/getTestScripts.js"),
    testScripts = getTestScripts(path.resolve(__dirname + "/../example/"));

var NOF5Bundler = require("../lib/bundler/NOF5Bundler.js");

describe("NOF5", function () {

    var bundler;

    beforeEach(function () {
        bundler = new NOF5Bundler();
    });

    describe(".construct()", function () {

        it("should be an EventEmitter", function () {

            expect(bundler instanceof EventEmitter).to.equal(true);

        });

    });

    describe("._get()", function () {

        it("should return a string", function () {
            expect(typeof bundler._get(testScripts)).to.be.equal("string");
        });

        it("should contain each given test-script", function () {

            var bundle = bundler._get(testScripts);

            _(testScripts).each(function testScriptsIterator (testScript) {
                testScript = testScript.replace(/\\/g, "\\\\");
                expect(bundle.search("//@ sourceURL=" + testScript) > -1).to.be(true);
            });
        });

        it("should pass a the bundle as string to onBundled callback", function (done) {

            bundler.on("bundleReady", function execDone(bundle) {

                expect(typeof bundle).to.equal("string");

                done();

            });

            bundler._get(testScripts);

        });

    });

});