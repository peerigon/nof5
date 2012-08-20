"use strict";

var _ = require("underscore");

var commanderMock = {

    options: {},

    /**
     * @param {string} flags
     * @param {string} description
     * @param {function.<*>} action
     * @param {*}standard
     * @return {commanderMock}
     */
    option: function (flags, description, action, standard) {
        this.options[flags] = {
            description: description,
            action: action,
            "default": standard
        };
        return this;
    },

    /**
     * @return {commanderMock}
     */
    version: function () {
        return this;
    },

    /**
     * @return {Object}
     */
    parse: function () {
        var parsedOptions = {};

        _(this.options).each(function createOptions(optionData, flagString) {
            var flagArray = flagString.split(" "),
                key;

            key = _(flagArray).find(function (flagString) {
                if (flagString.search("--") > -1) {
                    return true;
                }
            }).replace("--", "");

            parsedOptions[key] = optionData["default"];
        });

        return parsedOptions;
    }

};

module.exports = commanderMock;