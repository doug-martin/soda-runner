var Runner = require('../index.js'),
        assert = require("assert");

module.exports = {
    "create runner" : function() {
        var runner = new Runner();
        assert.equal('createClient', runner.client);
        assert.equal(4444, runner.port);
        assert.equal('localhost', runner.host);
        assert.equal('http://localhost', runner.url);
        assert.equal('firefox', runner.browserType);
        assert.equal('/', runner.baseUrl);
        assert.deepEqual({json : 1}, runner.mimeTypes);
    },

    "set testDir" : function() {
        var testDir = __dirname + "/tests/";
        var runner = new Runner({testDir : testDir});
        assert.equal(testDir, runner.testDir);
    },

    "set client" : function() {
        var runner = new Runner({client : "createSauceClient"});
        assert.equal("createSauceClient", runner.client);
    },

    "set port" : function() {
        var runner = new Runner({port : 8080});
        assert.equal(8080, runner.port);
    },

    "set host" : function() {
        var runner = new Runner({host : "www.google.com"});
        assert.equal("www.google.com", runner.host);
        assert.equal("http://www.google.com", runner.url);
    },

    "set browserType" : function() {
        var runner = new Runner({browserType : "chrome"});
        assert.equal("chrome", runner.browserType);
    },

    "set baseUrl" : function() {
        var runner = new Runner({baseUrl : "/soda"});
        assert.equal("/soda", runner.baseUrl);
    },

    "set mimeTypes" : function() {
        var runner = new Runner({mimeTypes : {html : 1}});
        assert.deepEqual({html : 1}, runner.mimeTypes);
    },

    "get browser without args" : function() {
        var runner = new Runner(), browser = runner.browser;
        assert.equal('localhost', browser.host);
        assert.equal(4444, browser.port);
        assert.equal("*firefox", browser.browser);
        assert.equal('http://localhost', browser.url);
    },

    "get browser with args" : function() {
        var runner = new Runner({url : "http://www.google.com", port : 8080,
            browserType : 'chrome'}), browser = runner.browser;
        assert.equal('localhost', browser.host);
        assert.equal(8080, browser.port);
        assert.equal("*chrome", browser.browser);
        assert.equal('http://www.google.com', browser.url);
    },

   "get test and files" : function() {
        var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
        var tests = runner.run("all");
        assert.deepEqual([__dirname + "/testFiles/externalCommand.json", __dirname + "/testFiles/googleTest.json"], tests)
    },

    "get test and run single test files" : function() {
        var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
        var tests = runner.run("all", ["googleTest"]);
        assert.deepEqual([__dirname + "/testFiles/googleTest.json"], tests)
    },

    "get test and run file with external command" : function() {
        var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
        var tests = runner.run("all", ["externalCommand"]);
        assert.deepEqual([__dirname + "/testFiles/externalCommand.json"], tests)
    }
}