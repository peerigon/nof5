"use strict";

var http = require("http"),
    expect = require("expect.js"),
    express = require("express"),
    rewire = require("rewire"),
    Bundler = require("../lib/Bundler.js"),
    SimpleExpressServer = rewire("../lib/SimpleExpressServer.js");

var testFolderPath,
    bundler,
    port,
    simpleExpressServer,
    expressServer,
    request,
    requestOptions;

describe("SimpleExpressServer", function () {

    before(function () {
        SimpleExpressServer.__set__({
            console: {
                log: function () { /* be quite */ }
            }
        });
    });

    beforeEach(function () {
        testFolderPath = __dirname + "/test_scenario/test/";
        bundler = new Bundler(testFolderPath, false);
        port = 43211;

        requestOptions = {
            host: "localhost",
            hostname: "localhost",
            port: port,
            method: "GET"
        };

        simpleExpressServer = new SimpleExpressServer(testFolderPath, bundler, port);
    });

    afterEach(function () {
        request.removeAllListeners && request.removeAllListeners();
        expressServer.close && expressServer.close();
    });

    describe("# start()", function () {

        it("should run a server which listens on port 43211", function (done) {
            expressServer = simpleExpressServer.start();

            request = http.request(requestOptions, function (res) {
                res.on("data", function () {
                    done();
                });
            });

            request.end();

        });

    });

});
