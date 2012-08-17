"use strict";

var path = require("path"),
    expect = require("expect.js"),
    testFolderPath = path.resolve(__dirname + "/../example/browserify/"),
    hooksFilePath = testFolderPath + "/nof5.browserify.hooks.js";

var Browserify = require("../lib/bundler/Browserify.js"),
    BrowserifyHooks = require("../lib/bundler/BrowserifyHooks.js");

describe("BrowserifyHooks", function () {

    var bundler,
        hooks;

    beforeEach(function () {
        bundler = new Browserify();
        hooks = new BrowserifyHooks(hooksFilePath, bundler);
    });

    describe("# construct()", function () {

        it("should throw an error if an invalid path to hook-file was passed", function () {
            expect(function () {
                hooks = new BrowserifyHooks("not/existing/path", bundler);
            }).to.throwError();
        });

        it("should throw an error if not a Browserify-Bundler was passed as second argument", function () {
            expect(function () {
                hooks = new BrowserifyHooks(hooksFilePath, {});
            }).to.throwError();
        });

    });

    describe("# exec()", function () {

        var hooksFile;

        before(function() {
            hooksFile = require(hooksFilePath);
            hooks.exec();
        });

        it("should execute use-hook", function () {
            expect(hooksFile.isUseExecuted()).to.be(true);
        });

        it("should execute ignore-hook", function () {
            expect(hooksFile.isIgnoreExecuted()).to.be(true);
        });

    });

});