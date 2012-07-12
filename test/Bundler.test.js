"use strict";

var expect = require("expect.js"),
    path = require("path");

var Bundler = require("../lib/Bundler.js"),
    ValidMockBundler = require("./mocks/ValidMockBundler.js"),
    getTestScripts = require("./mocks/helpers/getTestScripts.js");


describe("Bundler", function () {

    var bundler;

    it("should throw an Error if there is no file on given path", function () {
        expect(
            function () {
                bundler = new Bundler("not/existing/Bundler.js");
            }
        ).to.throwError();
    });

    it("should throw an Error if given bundler does not provide a method get()", function () {
        expect(
            function () {
                bundler = new Bundler(__dirname + "/mocks/InvalidMockBundlerWithoutGet.js");
            }
        ).to.throwError();
    });

    it("shall throw an Error if given bundler does provide a method get() but get() is not returning a string", function () {
        expect(
            function () {
                bundler = new Bundler(__dirname + "/mocks/InvalidMockBundlerWithoutGet.js");
            }
        ).to.throwError();
    });

    it("should pass all files with '.test.js' as extension within given test-folder to get()", function () {
        var testFolderPath = path.resolve(__dirname + "/../example/"),
            testScripts = getTestScripts(testFolderPath),

            bundler = new Bundler(__dirname + "/mocks/ValidMockBundler.js", testFolderPath),

            validMockBunder = new ValidMockBundler(),
            passedTestScripts;

        bundler.get();
        passedTestScripts = validMockBunder.getTestScripts();

        expect(passedTestScripts.length > 0).to.be(true);
        expect(passedTestScripts).to.be.eql(testScripts);
    });

});