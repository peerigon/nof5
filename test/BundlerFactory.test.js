"use strict";

var path = require("path");

var expect = require("expect.js");

var BundlerFactory = require("../lib/BundlerFactory.js"),
    validBundlerMockPath = path.resolve(__dirname + "/mocks/ValidMockBundler.js"),
    ValidBundlerMock = require( validBundlerMockPath),
    invalidBundlerMockPath = path.resolve(__dirname + "/mocks/InvalidMockBundlerWithoutGet.js"),
    InvalidBundlerMock = require(invalidBundlerMockPath),
    testFolderPath = path.resolve(__dirname + "/../example/");


describe("BundlerFactory", function () {

    var bundlerFactory;

    beforeEach(function () {
        bundlerFactory = new BundlerFactory();
    });

    describe(".build()", function () {

        it("should throw an Error if no bundler-path is given", function () {
            expect(function () {
                bundlerFactory.build();
            }).to.throwError();
        });

        it("should throw an Error if bundler does NOT provide an _get()", function () {
           expect(function () {
               bundlerFactory.build(InvalidBundlerMock);
           }).to.throwError();
        });

        it("should return an instance of ValidBundlerMock", function () {
           expect(bundlerFactory.build(validBundlerMockPath)).to.be.an(ValidBundlerMock);
        });

    });
    
    describe("Bundler", function () {
        
        var bundler;
        
        beforeEach(function () {
           bundler = bundlerFactory.build(validBundlerMockPath, testFolderPath);
        });

        describe(".get()", function () {

            it("should call given callback to .get()", function (done) {
                bundler.get(function onBundled() {
                    done();
                });
            });

            it("should pass a string to given callback", function () {
                bundler.get(function onBundled(string) {
                    expect(typeof string).to.equal("string");
                });
            });
        });
        
    });

});