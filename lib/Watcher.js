"use strict";

var fs = require("fs"),
    Finder = require("fshelpers").Finder,
    EventEmitter = require("events").EventEmitter,
    util = require("util"),
    _ = require("underscore");

function Watcher(rootFolder) {

    EventEmitter.call(this);

    var finder = new Finder(),
        watchDirOptions = {
            interval: 100
        },
        watchedDirs = {},
        self = this;

    /**
     * @return {array.<string>}
     */
    this.getWatchedDirs = function () {
        return _(watchedDirs).keys();
    };

    finder.on("dir", function onDir(fullDirPath) {

        if (watchedDirs[fullDirPath] === undefined) {
            watchedDirs[fullDirPath] = fs.watchFile(
                fullDirPath,
                watchDirOptions,
                function onDirChange(curr, prev) {
                    if (prev.mtime.getTime() < curr.mtime.getTime()) {
                        self.emit("change", fullDirPath);
                    }
            });
        }
    });

    finder.walkSync(rootFolder); //read files and dirs initially
}

util.inherits(Watcher, EventEmitter);

module.exports = Watcher;