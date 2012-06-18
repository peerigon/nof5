var expect = require("expect.js"),
    _ = require("underscore"),
    fs = require("fs"),
    DirectoryWatcher = require("../lib/DirectoryWatcher"),
    EventEmitter = require("events").EventEmitter;

describe("#DirectoryWatcher", function () {

    describe("#constructor", function () {
       it("should be a Function", function () {
            expect(DirectoryWatcher).to.be.a(Function);
       });

        it("should throw an Error if nothing is given as argument", function () {
            expect(function () {
                new DirectoryWatcher();
            }).to.throwError();
        });

        it("should throw an Error if a non-directory path is given", function () {
            expect(function () {
                new DirectoryWatcher(__filename);
            }).to.throwError();
        });

        it("should be a DirectoryWatcher", function () {
            expect(new DirectoryWatcher(__dirname)).to.be.a(DirectoryWatcher);
        });

        it("should inherit from EventEmitter", function () {
            expect(new DirectoryWatcher(__dirname)).to.be.an(EventEmitter);
        });
    });

    describe("#Events", function () {

        var directoryWatcher,
            dummyDirectory = __dirname + "/dummyDirectory/";

        beforeEach(function (done) {

            fs.mkdir(dummyDirectory, function (error) {
                if (error && error.code !== "EEXIST") {
                    throw error;
                }

                directoryWatcher = new DirectoryWatcher(dummyDirectory);

                done();
            });
        });

        afterEach(function () {
            directoryWatcher.close();
        });

        describe("#dirChange-Event", function () {

            it("should not throw an 'dirChange'-Event after a call of close()", function (done) {
                directoryWatcher.on("dirChange", function () {
                    throw new Error("Execution of 'dirChange'-Event-Listener after call to close: Test Failed.");
                });

                directoryWatcher.close();

                fs.rmdir(dummyDirectory, function (error) {
                    if (error) {
                        throw error;
                    }

                    done();
                });

            });

            it("should throw an 'dirChange'-Event if any change occurs in watched directory", function (done) {
                directoryWatcher.once("dirChange", function (event, filename) {
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