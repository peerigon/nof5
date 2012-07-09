(function () {

    "use strict";

    var socket = io.connect(document.location.protocol + "//" + document.location.host);

    function reRunTests() {
        console.log("re-running tests");
        location.reload();
    }

    socket.on("f5", reRunTests);

})();