"use strict";

var fs = require("fs"),
    path = require("path"),
    expect = require("expect.js");

var Watcher = require("../lib/Watcher.js"),
    EventEmitter = require("events").EventEmitter;

var testFolder = path.join(__dirname, "watchFolder"),
    testSomeFile = path.join(testFolder, "someFile.js"),
    testNewFile = path.join(testFolder, "newFile.js");

describe("Watcher", function () {

    var watcher;

    describe(".construct()", function () {

        it("should inherit from EvenEmitter", function () {
           expect(new Watcher(testFolder)).to.be.an(EventEmitter);
        });

        it("should throw an Error if a wrong path is given", function () {
            expect(function () {
                watcher = new Watcher("");
            }).to.throwError();
        });

    });

    describe("Events", function () {

        it("should emit 'ready' when the directory tree has been walked", function (done) {
            watcher = new Watcher(testFolder);
            watcher.on("ready", done);
        });

        it("should emit 'change' if a change in the given folder occurred", function (done) {
            var actions = [
                    function deleteFile() {
                        //console.log("delete");
                        fs.unlinkSync(testSomeFile);
                    },
                    function createFile() {
                        //console.log("create");
                        fs.writeFileSync(testNewFile, "new", "utf8");
                    },
                    function renameFile() {
                        //console.log("rename");
                        fs.renameSync(testNewFile, testSomeFile);
                    },
                    done
                ],
                watcher;

            this.timeout(20000);

            function next() {
                actions.shift()();
            }

            watcher = new Watcher(testFolder);
            watcher
                .on("ready", next)
                .on("change", next);
        });

    });

});