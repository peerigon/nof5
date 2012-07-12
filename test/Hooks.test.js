"use strict";

var path = require("path"),
    expect = require("expect.js");

var Hooks = require("../lib/Hooks.js");

describe("Hooks", function () {

   var hooksFilePath = path.resolve(__dirname + "/../example/nof5.hooks.js"),
       hooksFile,
       hooks;

    beforeEach(function () {

        delete require.cache[hooksFilePath];

        hooksFile = require(hooksFilePath);

        hooks = new Hooks();
        hooks.init(hooksFilePath);

    });

    describe("# init()", function () {

        describe("Errors", function () {

            it("should throw an Error if file on given path does not exist", function () {
                expect(hooks.init).to.throwError("");
            });

        });

        it("should return a reference to itself", function () {
            expect(hooks.init(hooksFilePath)).to.be.equal(hooks);
        });

    });

    describe("# exec()", function () {

        it("should return a reference to itself", function () {
            expect(hooks.exec()).to.be.equal(hooks);
        });

        it("should execute 'before'-hooks only once", function () {

            hooks.exec();
            hooks.exec();

            expect(hooksFile.getBeforeExecTimes()).to.be.equal(1);

        });

        it("should execute 'beforeEach'-hooks each time", function () {

            hooks.exec();
            hooks.exec();

            expect(hooksFile.getBeforeEachExecTimes()).to.be.equal(2);

        });

    });

});