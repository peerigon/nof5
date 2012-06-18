"use strict";

var _ = require("underscore"),
    fs = require("fs"),
    util = require("util"),
    fshelpers = require("fshelpers"),
    DirectoryWatcher = require("./DirectoryWatcher.js"),
    EventEmitter = require("events").EventEmitter;

/**
 * @param {String} dirPath
 * @constructor
 */
function DirectoryMasterWatchers(dirPath) {

    EventEmitter.call(this);

    var directoryWatchers = {},
        finder = new fshelpers.Finder(),
        dirChangeCallBacks = [],
        self = this;

    //Throw an error if no directory is given
    if (!fs.statSync(dirPath).isDirectory()) {
        throw new Error("DirectoryMasterWatcher is only able to master directories, but " + dirPath + " was given.");
    }

    /**
     * Close DirectoryMasterWatcher
     */
    this.close = function () {

        function closeWatcher(directoryWatcher) {
            directoryWatcher.removeAllListeners();
            directoryWatcher.close();
        }

        _.each(directoryWatchers, closeWatcher);
    };

    /**
     * Checks if directory is already in collection.
     *
     * @param {String} dirPath
     * @return {Boolean}
     * @private
     */
    function __isNewDirectory(dirPath) {
        var isNew = (directoryWatchers[dirPath] === undefined),
            isNotNodeModuels = (dirPath.indexOf("node_modules") === -1),
            isNotHiddenFolder = (dirPath.search(/[\/\\]\..*$/g) === -1);

        return isNew && isNotNodeModuels && isNotHiddenFolder;
    }

    /**
     * If directory at given directory has no DirectoryWatcher a new one will be created.
     *
     * @param {String} dirPath
     */
    function __addNewDirectoryWatcher(dirPath) {
        directoryWatchers[dirPath] = new DirectoryWatcher(dirPath);
        directoryWatchers[dirPath].on("dirChange", __onDirChange);
    }

    function __emitChange() {
        self.emit("change");
    }

    /**
     * On "dirChange"-Event all given callbacks will be executed.
     *
     * @param {String} event
     * @param {String} filename
     * @private
     */
    function __onDirChange(event, filename) {
        finder.once("end", __emitChange);
        finder.walkSync(dirPath);
    }

    /**
     * @param {String} dirPath
     * @private
     */
    function __onDir(dirPath) {
        if (__isNewDirectory(dirPath)) {
            __addNewDirectoryWatcher(dirPath);
        }
    }

    finder.on("dir", __onDir);

    //Initialize DirectoryWatcher
    finder.walkSync(dirPath);
}

util.inherits(DirectoryMasterWatchers, EventEmitter);

module.exports = DirectoryMasterWatchers;