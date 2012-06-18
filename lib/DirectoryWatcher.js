"use strict";

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    util = require("util"),
    path = require("path");

/**
 * @param {!String} dirPath
 */
function DirectoryWatcher(dirPath) {

    EventEmitter.call(this);

    var dirStat = fs.statSync(dirPath), //Will throw an Error if there is nothing on given path.
        fSWatcher,
        eventName = "dirChange",
        self = this;

    //Throw an Error if on given path is no directory
    if (!dirStat.isDirectory()) {
        throw new Error("Directory can only handle regular directories, but " + dirPath + " given.");
    }

    /**
     * @TODO Works only for linux
     *
     * @param {String} filename
     * @return {Boolean}
     * @private
     */
    function __isValidFile(filename) {
        return filename.search("___jb_bak___") === -1 && filename.search("___jb_old___") === -1;
    }

    function __onChange(event, filename) {
        if(__isValidFile(filename)) {
            self.emit(eventName, event, filename);
        }
    }

    this.close = function() {
        fSWatcher.removeAllListeners(eventName);
        fSWatcher.close();
    };

    fSWatcher = fs.watch(dirPath, __onChange);
}

util.inherits(DirectoryWatcher, EventEmitter);

module.exports = DirectoryWatcher;

