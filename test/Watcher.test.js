"use strict";

var fs = require("fs"),
    path = require("path"),
    expect = require("expect.js");

var Watcher = require("../lib/Watcher.js"),
    EventEmitter = require("events").EventEmitter;

var testFolderPath = path.resolve(__dirname + "/../example/"),
    dummyFolderName = "/dummyFolderName";

describe("Watcher", function () {

    var watcher;

    beforeEach(function () {
        watcher = new Watcher(testFolderPath);
    });

    describe(".construct()", function () {

        it("should inherit from EvenEmitter", function () {
           expect(watcher).to.be.an(EventEmitter);
        });

        it("should throw an Error if a wrong path is given", function () {
            expect(function () {
                watcher = new Watcher("");
            }).to.throwError();
        });

    });

    describe("Events", function () {

        it("should emit 'change' if a change with given folder occurred", function (done) {
            var filesOrDirs = fs.readdirSync(testFolderPath),
                oldTestFileName = filesOrDirs[0];

            watcher.on("change", function onChange() {
                done();
            });

            fs.renameSync(testFolderPath + "/" + oldTestFileName, testFolderPath + "/" + "brandNewName");
            fs.renameSync(testFolderPath + "/" + "brandNewName", testFolderPath + "/" + oldTestFileName);
        });

    });

});