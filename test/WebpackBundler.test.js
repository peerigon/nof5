"use strict"

var path = require("path"),
    EventEmitter = require("events").EventEmitter,

    expect = require("expect.js"),

    getTestScripts = require("./mocks/helpers/getTestScripts.js"),
    testScripts = getTestScripts(path.resolve(__dirname + "/../example")),

    WebpackBundler = require("../lib/bundler/WebpackBundler.js");

describe("WebpackBundler", function () {

    var bundler;

    beforeEach(function () {

        bundler = new WebpackBundler();

    });

    describe(".construct()", function () {

        it("should be an EventEmitter", function () {

            expect(bundler instanceof EventEmitter).to.equal(true);

        });

    });


    describe("._get()", function () {

        it("should pass a the bundle as string to onBundled callback", function (done) {

            bundler._get(testScripts, function onBundled (bundle) {

                expect(typeof bundle).to.equal("string");

                done();

            });

        });

        it("should emit an 'bundleReady'-Event and pass bundle as argument", function (done) {

            bundler.on("bundleReady", function execDone(bundle) {

                expect(typeof bundle).to.equal("string");

                done();

            });

            bundler._get(testScripts, function () {

                //do nothing

            });

        });

    });

});