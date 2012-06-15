"use strict";

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    util = require("util");

/**
 * @param {!String} dirPath
 */
function DirectoryWatcher(dirPath) {

    EventEmitter.call(this);

    var dirStat = fs.statSync(dirPath), //Will throw an Error if there is no file on given path.
        fSWatcher,
        lastChangeTime = new Date(),
        self = this;

    function hasOneSecondPassed(lastChangeTime, newChangeTime) {
        return (newChangeTime.getTime() - lastChangeTime.getTime()) / 1000 >= 1;
    }

    function __onChange(event, filename) {
        var newChangeTime = new Date();

        if(hasOneSecondPassed(lastChangeTime, newChangeTime)) {
            lastChangeTime = newChangeTime;
            self.emit("dirChange", event, filename);
        }
    }

    if (!dirStat.isDirectory()) {
        throw new Error("Directory can only handle directories, but " + dirPath + " given.");
    }

    this.close = function() {
        fSWatcher.close();
    };

    fSWatcher = fs.watch(dirPath, __onChange);
}

util.inherits(DirectoryWatcher, EventEmitter);

module.exports = DirectoryWatcher;

