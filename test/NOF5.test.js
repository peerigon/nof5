"use strict";

var _ = require("underscore"),
    path = require("path"),
    expect = require("expect.js"),
    getTestScripts = require("./mocks/helpers/getTestScripts.js"),
    testScripts = getTestScripts(path.resolve(__dirname + "/../example/"));

var NOF5Bundler = require("../lib/bundler/NOF5.js");

describe("NOF5", function () {

    var bundler;

    beforeEach(function () {
        bundler = new NOF5Bundler();
    });

    describe("# _get()", function () {

        it("should return a string", function () {
            expect(typeof bundler._get(testScripts)).to.be.equal("string");
        });

        it("should contain each given test-script", function () {

            var bundle = bundler._get(testScripts);

            _(testScripts).each(function testScriptsIterator (testScript) {
                expect(bundle.search("//@ sourceURL=" + testScript) > -1).to.be(true);
            });
        });

    });

});