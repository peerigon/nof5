"use strict";

function InvalidMockBundlerWithGet() {

    this._get = function () {
        return 1;
    };

}

module.exports = InvalidMockBundlerWithGet;