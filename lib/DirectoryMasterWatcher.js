"use strict";

var _ = require("underscore"),
    fs = require("fs"),
    util = require("util"),
    path = require("path"),
    fshelpers = require("fshelpers"),
    DirectoryWatcher = require("./DirectoryWatcher.js"),
    EventEmitter = require("events").EventEmitter;

/**
 * @constructor
 */
function DirectoryMasterWatcher() {

    EventEmitter.call(this);

    var excludedDirectories = ["node_modules"],
        directoryWatchers = {},
        finder = new fshelpers.Finder(),
        self = this;

    finder.on("dir", __onDir);

    /**
     * @param {String} dirPath
     * @return {DirectoryMasterWatcher}
     */
    this.watch = function (dirPath) {
        //Throw an error if no directory is given
        if (!fs.statSync(dirPath).isDirectory()) {
            throw new Error("DirectoryMasterWatcher is only able to master directories, but " + dirPath + " was given.");
        }
        //Close all directory Watchers
        if (_.size(directoryWatchers) > 0) {
            self.close();
            directoryWatchers = {};
        }
        //Read files
        finder.walkSync(dirPath);
        return this;
    };

    /**
     * If one path to exclude does not exist an Error will be thrown.
     * node_modules and .hiddens are excluded by default
     *
     * @param {Array|String} excludes
     * @return {DirectoryMasterWatcher}
     */
    this.excludeDirectories = function (excludes) {

        if (_.isString(excludes)) {
            excludes = [excludes];
        }

        function checkDirPath(dirPath) {
            if (!__isExistingPath(dirPath)) {
                throw new Error("Try to exclude non existing directory on path: " + path + ".");
            }
        }

        _.each(excludes, __isExistingPath);

        excludedDirectories = _.union(excludedDirectories, excludes);
        return this;
    };

    /**
     * Close DirectoryMasterWatcher
     */
    this.close = function () {

        function closeWatcher(directoryWatcher) {
            directoryWatcher.removeAllListeners();
            directoryWatcher.close();
        }

        _.each(directoryWatchers, closeWatcher);
        self.removeAllListeners();
    };

    /**
     * @param {String} dirPath
     * @return {Boolean}
     * @private
     */
    function __isExistingPath(dirPath) {
        return path.existsSync(dirPath);
    }

    /**
     * @param {String} dirPath
     * @return {Boolean}
     * @private
     */
    function __isExcluded(dirPath) {

        /**
         * @param {String} excludedDir
         * @return {Boolean}
         */
        function iterator(excludedDir) {
            return dirPath.search(excludedDir) > -1;
        }

        return _.any(excludedDirectories, iterator);
    }

    /**
     * Checks if directory is already in collection.
     *
     * @param {String} dirPath
     * @return {Boolean}
     * @private
     */
    function __isNewDirectory(dirPath) {
        var isNew = (directoryWatchers[dirPath] === undefined),
            isNotHiddenFolder = (dirPath.search(/[\/\\]\..*$/g) === -1),
            isExcluded = __isExcluded(dirPath);

        return isNew && isNotHiddenFolder && isExcluded === false;
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

    /**
     * @private
     */
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
        var walkPath = path.dirname(filename);

        finder.once("end", __emitChange);
        finder.walkSync(walkPath);
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
}

util.inherits(DirectoryMasterWatcher, EventEmitter);

module.exports = DirectoryMasterWatcher;