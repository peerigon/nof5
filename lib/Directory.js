"use strict";

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    util = require("util");

/**
 * @param {!String} dirPath
 */
function Directory(dirPath) {

    EventEmitter.call(this);

    var dirStat = fs.statSync(dirPath), //Will throw an Error if there is no file on given path.
        fSWatcher,
        self = this;

    function __onChange(event, filename) {
        self.emit("testDirChange", event, filename);
    }

    if (!dirStat.isDirectory()) {
        throw new Error("Directory can only handle directories, but " + dirPath + " given.");
    }

    fSWatcher = fs.watch(dirPath, __onChange);

    /**
     * Returns an array of filenames excluding '.' and '..'. @see http://nodejs.org/api/fs.html#fs_fs_rmdirsync_path
     *
     * @return {Array}
     */
    this.readDir = function () {
        return fs.readdirSync(dirPath);
    };
}

util.inherits(Directory, EventEmitter);

module.exports = Directory;

