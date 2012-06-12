var configure = require("./configure.js"),
    server = require("./server.js");

function start()  {
    var nconf = configure();
}

exports.start = start;