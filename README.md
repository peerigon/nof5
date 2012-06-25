nof5
====

[![Build Status](http://roomieplanet-dev.rz.hs-augsburg.de:8080/job/nof5/badge/icon)](http://roomieplanet-dev.rz.hs-augsburg.de:8080/job/nof5/)

See the following documentation as roadmap:

# Description

nof5 is a tool ...

# Running Tests

just execute: <code>nof5</code> in your test folder

# Conventions

Add a index.html with all dependencies to your test-folder's root. This will be the entry point for the tests.

#Features

* Use the test-runner of your choice (e.g. mocha)
* Use the assertion-suite of your choice (e.g. expect.js)
* Use the app specific environment (e.g. jQuery [Mobile], MooTools)
* nof5 is able to use [browserify](https://github.com/substack/node-browserify)
* Automated executing of tests in the browser if a change occurs in the test-folder ([socket.io](http://socket.io/)).