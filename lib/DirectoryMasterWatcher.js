"use strict";

var _ = require("underscore"),
    fshelpers = require("fshelpers"),
    DirectoryWatcher = require("./DirectoryWatcher.js");

/**
 * @param {String} dirPath
 * @constructor
 */
function DirectoryMaster(dirPath) {

    var directoryWatchers = {},
        finder = new fshelpers.Finder(),
        dirChangeCallBacks = [];

    /**
     * Add a callback which will be executed if a change in any directory occurs.
     *
     * @param {Function} callback
     * @return {DirectoryMasterWatcher}
     */
    this.addOnDirChange = function (callback)  {
        dirChangeCallBacks.push(callback);
        return this;
    };

    /**
     * Returns (full-)path of all watched directories as Array.
     * @return {Array}
     */
    this.getWatchedDirectories = function () {
        var watchedDirs = [];

        /**
         * @param {DirectoryWatcher} directoryWatcher
         * @param {String} key (key === dirPath)
         */
        function pushPath(directoryWatcher, key) {
            watchedDirs.push(key);
        }

        _.each(directoryWatchers, pushPath);

        return watchedDirs;
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
        if (__isNewDirectory(dirPath)) {
            directoryWatchers[dirPath] = new DirectoryWatcher(dirPath);
            directoryWatchers[dirPath].on("dirChange", __onDirChange);
        }
    }

    /**
     * Execute a callback.
     *
     * @param {Function} callback
     * @private
     */
    function __execOnDirChangeCallback(callback) {
        console.log(callback);
        callback();
    }

    /**
     * Execute all callbacks which was attached for "dirChange"-Event.
     *
     * @private
     */
    function __execAllOnDirChangeCallbacks() {
        console.log("__execAllOnDirChangeCallbacks");
        _.each(dirChangeCallBacks, __execOnDirChangeCallback);
    }

    /**
     * On "dirChange"-Event all given callbacks will be executed.
     *
     * @param {String} event
     * @param {String} filename
     * @private
     */
    function __onDirChange(event, filename) {
        console.log("found change in " + filename);
        //finder.once("idle", __execAllOnDirChangeCallbacks); //@TODO This is not working reliable
        //@TODO walk only directory where change has occurred for better performance
        finder.walkSync(dirPath);
        __execAllOnDirChangeCallbacks();
    }

    /**
     * @param {String} dirPath
     * @private
     */
    function __onDir(dirPath) {
        __addNewDirectoryWatcher(dirPath);
    }

    finder.on("dir", __onDir);

    //Initialize DirectoryWatcher
    finder.walkSync(dirPath);
}

module.exports = DirectoryMaster;