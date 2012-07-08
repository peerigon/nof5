"use strict";

var beforeExecTimes = 0,
    beforeEachExecTimes = 0;

exports.before = function () {
    ++beforeExecTimes;
};

exports.getBeforeExecTimes = function() {
    return beforeExecTimes;
};

exports.beforeEach = function () {
  ++beforeEachExecTimes;
};

exports.getBeforeEachExecTimes = function () {
    return beforeEachExecTimes;
};