var expect = require("expect.js"),
    _ = require("underscore"),
    DirectoryMasterWatcher = require("../lib/DirectoryMasterWatcher.js");

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
    });

    describe("#methods", function () {

        var nof5RootDir = __dirname.replace("/test", ""),
            dMW = new DirectoryMasterWatcher(nof5RootDir),
            watchedDirectories = dMW.getWatchedDirectories(),
            directoryFilter = /[\/\\]\..*$/g;

        function isValidDirectory(dirPath) {
            return dirPath.search(directoryFilter) === -1;
        }

        function isNodeModulesDirectory(dirPath) {
            return dirPath === "node_modules";
        }

        describe("#getWatchedDirectories()", function () {

            it("should return an Array", function () {
                expect(watchedDirectories).to.be.an(Array);
            });

            it("should return an Array with at least one item/path to a dir", function () {
                expect(watchedDirectories.length > 0).to.be.ok();
            });

            it("should contain only paths to (visible/no dot as prefix) directories", function () {
                _.each(watchedDirectories, function (dirPath) {
                    expect(isValidDirectory(dirPath)).to.be.ok();
                });
            });

            it("should not contain any node_modules directory", function () {
                _.each(watchedDirectories, function (dirPath) {
                    expect(isNodeModulesDirectory(dirPath)).not.to.be.ok();
                });
            });

        });
    });
});