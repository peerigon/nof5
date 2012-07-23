nof5
====

[![Build Status](http://roomieplanet-dev.rz.hs-augsburg.de:8080/job/nof5/badge/icon)](http://roomieplanet-dev.rz.hs-augsburg.de:8080/job/nof5/)

# What is nof5?

**nof5** is a server for automated browser testing based on express and socket.io. It watches your lib- and test-folder
and emits on a change an event called **f5** to all connected clients. You can connect as many browsers as you want.
On **f5** the clients can fetch a new test-bundle and re-run it. So you don't have to manually reload your tests. That's
why it is called *nof5*.
It is also possible to send the test results back to the server. 

Result will be displayed like this if they succeed

> 13:20:55 Chrome/20.0.1132/Linux has connected 

> 13:20:55 Chrome/20.0.1132/Linux has succeeded. Tests took 0.617 seconds

or like this if they fail

>13:31:34 Android/2.3.4/Android has failed. Tests took 5.625 seconds

>{ '.isAppended()': 
   { test: 'should be false after # dispose()',
     type: 'Error: expected false to equal true' } }
     
Writing xunit-files is on the road.

**nof5** does not ship any test-suites like mocha or assertions suites like expect.js. So you can use any lib for writing
you want to. But there is a [recipe](https://github.com/peerigon/nof5/blob/master/example/assets/testRunner.js) for mocha 
and expect.js in the examples.

# How to install it?

    npm install -g nof5
    
# How to use it ?

## Server

## Client





