var soda = require('./sodaWrapper').soda,
        path = require("path"),
        assert = require('assert'),
        parser = require('./util/parser'),
        fs = require('fs');

soda.addCommand('wait');
soda.addCommand('assertTextNotPresent');
soda.addCommand('refreshAndWait');


var resolvePath = function(testDir, suite, test) {
    testDir += suite ? "/" + suite : "";
    testDir += test ? "/" + test + ".json" : "";
    return testDir;
}

var getAllTests = function(dirName, mimeTypes) {
    var tests = [];

    function canParse(fileName) {
        var ext = path.extname(fileName).replace(".", "");
        return ext in mimeTypes;
    }
    if (fs.statSync(dirName).isDirectory()) {
        /*  Create the directory where all our junk is moving to; read the mode of the source directory and mirror it */
        var files = fs.readdirSync(dirName);
        for (var i = 0; i < files.length; i++) {
            var currFileName = dirName + "/" + files[i],
                    currFile = fs.statSync(currFileName);
            if (currFile.isDirectory()) {
                tests = tests.concat(getAllTests(currFileName, mimeTypes));
            } else if (canParse(currFileName, mimeTypes)) {
                tests.push(currFileName);
            }
        }
    }
    return tests;
}

var runner = exports = module.exports = function Runner(args) {
    var props = {}, args = args || {};
    props.testDir = args.testDir || __dirname;
    props.client = args.client || "createClient";
    props.port = args.port || 4444;
    props.host = args.host || "localhost";
    props.url = args.url || "http://{host}".replace("{host}", props.host);
    props.browserType = args.browserType || 'firefox';
    props.baseUrl = args.baseUrl || '/';
    props.mimeTypes = args.mimeTypes || { json : 1};
    function defineSetGet(prop) {
        this.__defineGetter__(prop, function() {
            return props[prop]
        })
        this.__defineSetter__(prop, function(val) {
            props[prop] = val;
        })
    }

    for (var i in props) {
        defineSetGet.apply(this, [i]);
    }
    this.__defineGetter__("browser", function() {
        var browser;
        if (soda[this.client]) {
            browser = soda[this.client]({
                host: this.host,
                port: this.port,
                url: this.url,
                browser: this.browserType
            });
            // Log commands as they are fired
            browser.on('command', function(cmd, args) {
                console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
            });
        } else {
            throw new Error("Client of type '" + client + "' is not supported!");
        }
        return browser;
    });
}

runner.prototype.run = function(suite, tests) {
    console.log(suite + tests)
    var testFiles = [];
    if (!tests) tests = "all"
    if (suite == "all") suite = null;
    if (tests == 'all' && suite == "all") {
        testFiles = getAllTests(this.testDir, this.mimeTypes)
    } else if (tests == "all") {
        if (suite && suite instanceof Array) {
            suite.forEach(function(s) {
                testFiles = testFiles.concat(getAllTests(this.testDir + '/' + s, this.mimeTypes));
            }, this);
        } else if (suite) {
            testFiles = testFiles.concat(getAllTests(this.testDir + '/' + suite, this.mimeTypes));
        } else {
            testFiles = testFiles.concat(getAllTests(this.testDir, this.mimeTypes));
        }
    } else {
        if (tests instanceof Array) {
            testFiles = tests.map(function(t) {
                return resolvePath(this.testDir, suite, t);
            }, this);
        } else {
            testFiles.push(resolvePath(this.testDir, suite, tests));
        }
    }
    if (testFiles.length) {
        var browser = this.browser;
        browser.chain.session()
                .windowMaximize()
                .open(this.baseUrl);
        parser.parse(testFiles, browser);
        browser.testComplete()
                .end(function(err) {
            if (err) console.error(err)
            else console.log("All tests passed");
        });
    } else {
        console.log("No tests found")
    }
    return testFiles;
};
