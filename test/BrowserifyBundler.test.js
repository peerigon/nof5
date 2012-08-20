"use strict";

var expect = require("expect.js"),
    path = require("path"),
    getTestScripts = require("./mocks/helpers/getTestScripts.js"),
    testScripts = getTestScripts(path.resolve(__dirname + "/../example"));


var BrowserifyBundler = require("../lib/bundler/BrowserifyBundler.js");

describe("BrowserifyBundler", function () {

    var bundler;

    beforeEach(function () {
        bundler = new BrowserifyBundler();
    });

    describe("# _get()", function () {

        it("should return a string", function () {
           expect(typeof bundler._get(testScripts)).to.be.equal("string");
        });

    });

    describe("# use", function () {

        it("should use given middleware for bundling", function (done) {
            bundler.use(function () {
                done();
            });
            bundler._get();
        });

        it("should also except a collection of middleware as an array", function (done) {
            bundler.use([
                function () {
                    //Do nothing
                },
                function () {
                    done();
                }
            ]);
            bundler._get();
        });

        it("should use middleware in the given order", function () {
            var predictedOrder = [1, 2, 3],
                executionOrder = [];
            bundler.use(function () {
                executionOrder.push(1);
            });
            bundler.use([
                function () {
                    executionOrder.push(2);
                },
                function () {
                    executionOrder.push(3);
                }
            ]);
            bundler._get();

            expect(executionOrder[0]).to.be.equal(predictedOrder[0]);
            expect(executionOrder[1]).to.be.equal(predictedOrder[1]);
            expect(executionOrder[2]).to.be.equal(predictedOrder[2]);
        });

        it("should return a reference to itself", function () {
            expect(bundler.use()).to.be.equal(bundler);
        });

    });

    describe("# ignore()", function () {

        /*
        it("should ignore given files", function () {
            var bundle;

            bundler.ignore();
            bundle = bundler.get(testScripts);
            expect(bundle.search(/ /g)).to.be.equal(-1);

        });
        */

        it("should return a reference to itself", function () {
            expect(bundler.ignore()).to.be.equal(bundler);
        });

    });

});