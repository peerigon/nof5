"use strict";

var expect = require("expect.js"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    DirectoryMasterWatcher = require("../lib/DirectoryMasterWatcher.js"),
    EventEmitter = require("events").EventEmitter;

describe("DirectoryMasterWatcher", function () {

    var dummyDirectory = __dirname + "/dummyDirectory/";

    describe("#constructor", function () {

        it("should be a Function", function () {
            expect(DirectoryMasterWatcher).to.be.a(Function);
        });

        it("should be a DirectoryMasterWatcher", function () {
            expect(new DirectoryMasterWatcher()).to.be.a(DirectoryMasterWatcher);
        });

        it("should inherit from EventEmitter", function () {
            expect(new DirectoryMasterWatcher()).to.be.an(EventEmitter);
        });

    });

    describe("# watch()", function () {

        var directoryMasterWatcher;

        beforeEach(function () {
            directoryMasterWatcher = new DirectoryMasterWatcher();
        });

        describe("Error", function () {

            it("should throw an Error if no directory path given", function () {
                expect(function () {
                    directoryMasterWatcher.watch();
                }).to.throwError();
            });

            it("should throw an Error if path to a file is given", function () {
                expect(function () {
                    directoryMasterWatcher.watch(__filename);
                }).to.throwError();
            });

            it("should throw an Error on a second call of # watch()", function () {
                fs.mkdirSync(dummyDirectory);

                directoryMasterWatcher.watch(__dirname);

                expect(function () {
                    directoryMasterWatcher.watch(__dirname);
                }).to.throwError();


                fs.rmdirSync(dummyDirectory);
            });

        });

    });

    describe("#Events", function () {

        var directoryMasterWatcher;

        beforeEach(function () {
            directoryMasterWatcher = new DirectoryMasterWatcher();

            fs.mkdirSync(dummyDirectory);

            directoryMasterWatcher.watch(__dirname);
        });

        afterEach(function () {
            directoryMasterWatcher.close();
        });

        describe("#change-Event", function () {

            it("should NOT throw an 'change'-Event after a call of close()", function (done) {
                directoryMasterWatcher.on("change", function () {
                    throw new Error("Execution of 'change'-Event-Listener after call to close: Test Failed.");
                });

                directoryMasterWatcher.close();

                fs.rmdirSync(dummyDirectory);

                done();
            });

            it("should throw an 'change'-Event if in any watched directory a change occurs", function (done) {
                directoryMasterWatcher.once("change", function (event, filename) {
                    done();
                });

                fs.rmdirSync(dummyDirectory);
            });
        });
    });
});