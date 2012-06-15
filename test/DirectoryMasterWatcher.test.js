var expect = require("expect.js"),
    fs = require("fs"),
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

    describe("#api", function () {

        var nof5RootDir = __dirname + "/../",
            dMW = new DirectoryMasterWatcher(nof5RootDir),
            allRootDirFiles,
            rootDirDirectories = [],
            rootDirFiles = [];

        before(function (done) {
            fs.readdir(nof5RootDir, function (err, files) {
                allRootDirFiles = files;

                function filterFiles(filePath, index) {
                    if (fs.statSync(filePath).isFile()) {
                        rootDirFiles.push(filePath);
                    } else {
                        rootDirDirectories.push(filePath);
                    }
                }

                _.each(allRootDirFiles, filterFiles);

                done();
            });
        });

        describe("#addOnDirChange", function () {

            var getWatchedDirectoriesReturn = dMW.getWatchedDirectories();

            console.log(getWatchedDirectoriesReturn);

            it("should return an Array", function () {
                expect(getWatchedDirectoriesReturn).to.be.an(Array);
            });

            it("should contain no path to a file", function () {
                expect(_.difference(allRootDirFiles, rootDirFiles)).to.be.equal(getWatchedDirectoriesReturn);
            });

            it("should contain no hidden files or rather no files beginning with a dot(e.g. .git)", function () {
                _.each(getWatchedDirectoriesReturn, function (dirPath, index) {
                    expect(dirPath.search(/[\/\\]\..*$/g)).to.be.equal(-1);
                });
            });

            it("should contain only paths to directories", function () {

            });

        });
    });
});