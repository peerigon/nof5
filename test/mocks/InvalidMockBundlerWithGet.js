"use strict";

function InvalidMockBundlerWithGet() {

    this.get = function () {
        return 1;
    };

}

module.exports = InvalidMockBundlerWithGet;