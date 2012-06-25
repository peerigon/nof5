"use strict";

/**
 * @param {string} url
 * @param {function} callback
 */
module.exports = function loadScript(url, callback) {

    var script = document.createElement('script');

    script.src = url;
    script.type = 'text/javascript';

    document.getElementsByTagName("head")[0].appendChild(script); // add script tag to head element

    // this crazy hack identifies IE
    if('\v'=='v') {
        script.onreadystatechange = function () {

            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                callback();
            }

        };

    } else {

        script.onload = callback;

    }
};