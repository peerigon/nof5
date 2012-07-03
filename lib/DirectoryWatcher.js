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
        return filename.search(/_jb_bak_/g) === -1 && filename.search(/_jb_old_/g) === -1;
    }

    function __onChange(event, filename) {
        if(__isValidFile(filename)) {
            self.emit(eventName, event, filename);
        }
    }

    this.close = function() {
        fSWatcher.removeAllListeners();
        //@TODO If close is called this error appears: "FSEventWrap: Aborting due to unwrap failure at ../src/fs_event_wrap.cc:169"
        //fSWatcher.close();
    };

    fSWatcher = fs.watch(dirPath, __onChange);
}

util.inherits(DirectoryWatcher, EventEmitter);

module.exports = DirectoryWatcher;

