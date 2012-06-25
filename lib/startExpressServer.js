"use strict";

var express = require("express");

/**
 *
 * @param {String} testFolderPath
 * @param port
 * @return {*}
 */
function start(testFolderPath, port) {

    var server,

    server = express.createServer();

    function configure() {
        //Setup middleware
        server.use(express.bodyParser());
        server.use(express.methodOverride());
        server.use(server.router);

        //Make test-folder accessable
        server.use(testFolderPath, express.static(testFolderPath));
        //Make test-folder's asserts accessable
        server.use(testFolderPath + "/asserts/", express.static(testFolderPath + "/asserts/"));
    }
    
    // Configure express app
    server.configure(configure);

    server.get("/", testFolderPath + "/index.html");

    //Start express-server
    server.listen(port, function(){
        console.log("Tests are running at http://localhost:%d/", server.address().port);
    });

    return server;
}

exports.start = start;