"use strict";

var expect = require("expect.js");

var Finder = require("fshelpers").Finder;

var Bundler = require("../lib/Bundler.js"),
    ValidMockBundler = require("./mocks/ValidMockBundler.js");


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
        var testFolderPath = __dirname + "/test_scenario/",
            bundler = new Bundler(
                __dirname + "/mocks/ValidMockBundler.js",
                testFolderPath
            ),
            validMockBunder = new ValidMockBundler(),
            testScripts = [],
            passedTestScripts,
            finder = new Finder();

        finder.on("file", function onFile (file) {
            if (file.search(/\.test\.js/g) >= -1) {
                testScripts.push(file);
            }
        });

        finder.walkSync(testFolderPath);

        bundler.get();
        passedTestScripts = validMockBunder.getTestScripts();


        expect(passedTestScripts.length > 0).to.be(true);
        expect(passedTestScripts).to.be.eql(testScripts);

    });

});