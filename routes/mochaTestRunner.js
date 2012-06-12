"use strict";


//Render Mocha Test-Runner
module.exports = function mochaTestRunner(req, res) {
    res.render("mochaTestRunner", {
        title: "Mocha Test-Runner",
        tests: [],
        assertionSuite: "expect"
    });
};