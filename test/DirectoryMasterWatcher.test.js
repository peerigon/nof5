var expect = require("expect.js"),
    fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    DirectoryMasterWatcher = require("../lib/DirectoryMasterWatcher.js"),
    EventEmitter = require("events").EventEmitter;

describe("#DirectoryMasterWatcher", function () {

    describe("#constructor", function () {
        it("should be a Function", function () {
            expect(DirectoryMasterWatcher).to.be.a(Function);
        });

        it("should throw an Error if no directory path given", function () {
            expect(function () {
                new DirectoryMasterWatcher();
            }).to.throwError();
        });

        it("should throw an Error if path to a file is given", function () {
            expect(function () {
                new DirectoryMasterWatcher(__filename);
            }).to.throwError();
        });

        it("should be a DirectoryMasterWatcher", function () {
            expect(new DirectoryMasterWatcher(__dirname)).to.be.a(DirectoryMasterWatcher);
        });

        it("should inherit from EventEmitter", function () {
            expect(new DirectoryMasterWatcher(__dirname)).to.be.an(EventEmitter);
        });
    });

    describe("#Events", function () {

        var directoryMasterWatcher,
            nof5RootDir = path.resolve(__dirname + "/../"),
            dummyDirectory = __dirname + "/dummyDirectory/";

        beforeEach(function (done) {
            directoryMasterWatcher = new DirectoryMasterWatcher(nof5RootDir);

            fs.mkdir(dummyDirectory, function (error) {

                if (error && error.code !== "EEXIST") {
                    throw error;
                }

                done();
            });
        });

        afterEach(function () {
            directoryMasterWatcher.close();
        });

        describe("should not throw an 'dirChange'-Event after a call of close()", function () {

            it("should not throw an 'dirChange'-Event after a call of close()", function (done) {
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