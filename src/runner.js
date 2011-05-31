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

/*var browser = soda.createSauceClient({
    'url': 'http://example.saucelabs.com/'
    , 'username': 'pollenware'
    , 'access-key': '562e7ea9-5d17-4c49-9208-31ba4fa2eed0'
    , 'os': 'Windows 2003'
    , 'browser': 'firefox'
    , 'browser-version': '3.6'
    , 'name': 'This is an example test'
    , 'max-duration': 300
});*/

function normalizeArgs(args) {
    var ret = {};
    for (var i in args) {
         var arg = args[i];
        switch (i) {
            case "client" :
                if(arg == 'local') ret[i] = "createClient";
                else if(arg == 'sauce') ret[i] = 'createSauceClient'
                break;
            case "browserType" :
                ret['browser'] = arg;
                break;
            case "accessKey" :
                ret['access-key'] = arg;
                break;
            case "browserVersion" :
                ret['browser-version'] = arg;
                break;
            case "maxDuration" :
                ret['max-duration'] = arg;
                break;
            case "userName" :
                ret['username'] = arg;
                break;
            default :
                ret[i] = arg;
        }
    }
    return ret;
}

var runner = exports = module.exports = function Runner(args) {
    console.log(args);
    var props = {}, args = args || {};
    props.testDir = args.testDir || __dirname;
    props.client = args.client || "createClient";
    props.accessKey = args.accessKey || null
    props.os = args.os || null;
    props.userName = args.userName || null;
    props.browserVersion = args.browserVersion || null,
            props.port = args.port || 4444;
    props.client != 'sauce' && (props.host = args.host || "localhost");
    props.url = args.url || "http://{host}".replace("{host}", props.host);
    props.browserType = args.browserType || 'firefox';
    props.baseUrl = args.baseUrl || '/';
    props.maxDuration = args.maxDuration || 300;
    props.timeout = args.timeout || 30000;
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
        var args = normalizeArgs(props);
        console.log(args);
        if (soda[args.client]) {
            browser = soda[args.client](args);
            // Log commands as they are fired
            browser.on('command', function(cmd, args) {
                console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
            });
        } else {
            throw new Error("Client of type '" + args.client + "' is not supported!");
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
                .setTimeout(this.timeout)
                .windowMaximize()
                .open(this.baseUrl);
        parser.parse(testFiles, browser);
        browser.testComplete()
                .end(function(err) {
            if (err) console.error(err)
            else console.log("All tests passed");
            return;
        });
    } else {
        console.log("No tests found")
    }
    return testFiles;
};
