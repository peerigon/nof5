var expect = require("expect.js"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    DirectoryMasterWatcher = require("../lib/DirectoryMasterWatcher.js"),
    EventEmitter = require("events").EventEmitter;

describe("#DirectoryMasterWatcher", function () {

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

    describe("#watch", function () {

        var directoryMasterWatcher;

        beforeEach(function () {
            directoryMasterWatcher = new DirectoryMasterWatcher();
        });

        describe("#Error-Handling", function () {

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

        });

        describe("#second call", function () {
            it("should close all existing watchers on a second valid call to watch() and create new ones", function (done) {
                fs.mkdir(dummyDirectory, function (error) {
                    if (error) {
                        throw error;
                    }

                    directoryMasterWatcher.watch(__dirname);
                    directoryMasterWatcher.on("change", function () {
                        throw new Error("Test failed. Close was called an this listener should be dead.");
                    });

                    directoryMasterWatcher.close();

                    directoryMasterWatcher.watch(__dirname);
                    directoryMasterWatcher.once("change", function () {
                        done();
                    });

                    fs.rmdir(dummyDirectory, function (error) {
                        if (error) {
                            throw error;
                        }
                    });

                });
            });
        });

    });

    describe("#Events", function () {

        var directoryMasterWatcher;

        beforeEach(function (done) {
            directoryMasterWatcher = new DirectoryMasterWatcher();


            fs.mkdir(dummyDirectory, function (error) {

                if (error && error.code !== "EEXIST") {
                    throw error;
                }

                directoryMasterWatcher.watch(__dirname);

                done();
            });
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

                fs.rmdir(dummyDirectory, function (error) {
                    if(error) {
                        throw error;
                    }

                    done();
                });
            });

            it("should throw an 'change'-Event if in any watched directory a change occurs", function (done) {
                directoryMasterWatcher.once("change", function (event, filename) {
                    done();
                });

                fs.rmdir(dummyDirectory, function (error) {
                    if (error) {
                        throw error;
                    }
                });
            });
        });
    });
});