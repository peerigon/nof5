# nof5

is a server that runs **Unit Tests** with the help of test-suites like

- [QUnit](http://qunitjs.com/) or
- [Mocha](http://visionmedia.github.com/mocha/)

on any number of mobile or desktop browsers simultaneously and automatically.
nof5 is independent of these test suites and can be used with any suite.
Therefore is should be simple to integrate nof5 with existing tests.
nof5 is based on

- [express](http://expressjs.com/) and
- [socket.io](http://socket.io/)

It also supports *Web-Bundler*s such as

- [browserify](https://github.com/substack/node-browserify) or
- [webpack](https://github.com/webpack/webpack)

and can be customized to one's own needs with the help of **Hooks** as

- before
- beforeEach

Additionally nof5 supports the **xUnit** format and can therefore be integrated in **Continuous Integration** servers such as

- [Jenkins](http://jenkins-ci.org/)


## Motivation

We originally built nof5 for our client-and server-side framework [alamid.js] (http://alamidjs.com/).
[alamid.js] (http://alamidjs.com/) makes it possible that the client code can be written exactly as for the server.
We use for the classes of [alamid.js] (http://alamidjs.com/) our JavaScript compiler [nodeclass] (https://npmjs.org/package/nodeclass)
and the client-side code will be bundled with the help of [WebPack] (https://github.com/webpack/webpack).
We also develop [alamid.js](http://alamidjs.com/) using Contiuous integration and Jenkins.
There was no tool that combines all these technologies.

## Installation

<code>npm install -g nof5</code>

## Options

Usage: nof5 [options]

    -h, --help            output usage information
    -V, --version         output the version number
    -d, --debug           outputs some additional debug output, such as a list of watched folders
    -s, --silent          run without console logging
    --list                lists all bundler names
    -p, --port <n>        server port. Default: 11234
    -t, --test <dir>      path to test folder. Default: process.cwd()
    -l, --lib <dir>       path to lib folder
    -a, --assets <dir>    path to folder where additionally files should be also served as statics
    -b, --bundler <name>  defines the bundler which should be used. Default: 'Webpack'
    -H, --hooks <file>    path to file with hooks
    -W, --wphooks <file>  path to file with hooks for webpack-bundler
    -B, --bhooks <file>   path to file with hooks for browserify-bundler
    -x, --xunit <dir>     path to store xunit.xml file.
    -c, --clients <file>  use given client hook

## How to use

### start nof5

Just execute on command line from test's root folder <code>nof5</code> or from anywhere <code>nof5 -t path/to/test/folder</code>

### hooks

#### define general hooks (optional)

Define a file named <code>nof5.hooks.js</code> under test's root folder or pass the path to the hooks-file <code> nof5 -H path/to/hooks/file</code>

The hooks-file should look like this:

```javascript

    exports.before = function beforeHook() {
       //will be executed once
    }

    exports.beforeEach = function() {
       //will be executed each time
    }

```

#### define webpack hooks (optional)

Define a file named <code>nof5.webpack.hooks.js</code> under test's root folder or or pass the path to the webpack-hooks-file <code> nof5 -W path/to/webpack/hooks/file</code>

The webpack-hooks.file should look like this:

```javascript

    exports.use = function () {

        return {
            // webpack-options @see https://github.com/webpack/webpack#options
        };

    }

```

#### define browserify hooks (optional)

Define a file named <code>nof5.browserify.hooks.js</code> under test's root folder or or pass the path to the browserify-hooks-file <code> nof5 -B path/to/browserify/hooks/file</code>

The webpack-hooks.file should look like this:

```javascript

    exports.use = function () {

        "middlewareA": function () {
            //@see https://github.com/substack/node-browserify/blob/master/doc/methods.markdown#busefn
        },

        "middlewareB": function () {
            // ...
        }
    }

```


### Create a Test-Runner

All files under root-folder are served as static files by nof5, so you can use any assets you like, e.g. jQuery, QUnit or Mocha.

```html

     <!-- include socket.io to notify the client that a change on files has occured -->
     <script type="text/javascript" src="/socket.io/socket.io.js"></script>

     <!-- include nof5 which will create a socket and configure it -->
     <script type="text/javascript" src="/nof5.js"></script>

     <!-- load the tests. NOTE: You must execute the tests manually with nof5.enableTests()-->
     <script type="text/javascript" src="tests.js"></script>

     <script>//configure your test-runner</script>

     <script>nof5.enableTests()</script>


```

See also the example implementation of a [Test-Runner](https://github.com/peerigon/nof5/blob/master/example/webpack/assets/testRunner.js).

### Use with Jenkins

 TODO