"use_strict";

var Dir = require("../lib/Directory.js"),
    dir,
    isModuleRootDir = false,
    files,
    nconf = require("nconf");


function findPackageJSON(file, index) {
    if (file === "package.json") {
        isModuleRootDir = true;
    }
}

//Initialize given directory
dir = new Dir(process.cwd());

//Read files from given directory
files = dir.readDir();
files.forEach(findPackageJSON);

//Check if directory is a module's root directory
if (!isModuleRootDir) {
    throw new Error("package.json not found. You must execute nof5 within a module's root directory.");
}

//Render Mocha Test-Runner
exports.mochaTestRunner = function(req, res) {
    res.render("mochaTestRunner", {
        title: "Mocha Test-Runner"
    });
};