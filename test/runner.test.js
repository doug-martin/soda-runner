var Runner = require('../index.js'),
		assert = require("assert"),
		comb = require("comb"),
		vows = require("vows");
var testDir = __dirname + "/tests/";
var suite = vows.describe("Runner object");
suite.addBatch({
			"whe creating a runner" : {
				topic : function() {
					return new Runner();
				},

				"it should default the appropriate values" : function(runner) {
					//assert.equal('createClient', runner.client);
					assert.equal(runner.port, 4444);
					assert.equal(runner.host, 'localhost');
					assert.equal(runner.url, 'http://localhost');
					assert.equal(runner.browser, 'firefox');
					assert.equal(runner.baseUrl, '/');
					assert.deepEqual(runner.mimeTypes, {json : 1});
				}
			},

			"whe creating a runner with a test directory" : {
				topic : function() {

					return new Runner({testDir : testDir});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.testDir, testDir);
				}
			},

			"whe creating a runner with a specified client" : {
				topic : function() {
					return new Runner({client : Runner.SAUCE});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.client, "createSauceClient");
				}
			},

			"whe creating a runner with a port" : {
				topic : function() {
					return new Runner({port : 8080});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.port, 8080);
				}
			},

			"whe creating a runner with a host" : {
				topic : function() {
					return new Runner({host : "www.google.com"});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.host, "www.google.com");
					assert.equal(runner.url, "http://www.google.com");
				}
			},

			"whe creating a runner with a specific browser" : {
				topic :  function() {
					return new Runner({browser : "chrome"});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.browser, "chrome");
				}
			},

			"whe creating a runner with a particular browser url" : {
				topic : function() {
					return new Runner({baseUrl : "/soda"});
				},
				" it should contain the proper tests" : function(runner) {
					assert.equal(runner.baseUrl, "/soda");
				}
			},

			"whe creating a runner with a particular mimetypes" : {
				topic : function() {
					return new Runner({mimeTypes : {html : 1}});
				},
				" it should contain the proper tests" : function(runner) {
					assert.deepEqual(runner.mimeTypes, {html : 1});
				}
			},

			"whe creating a runner without args and getting the browser" : {
				topic :  function() {
					return new Runner();
				},
				" it should contain the proper tests" : function(runner) {
					var browser = runner.sodaClient;
					assert.equal(browser.host, 'localhost');
					assert.equal(browser.port, 4444);
					assert.equal(browser.browser, "*firefox");
					assert.equal(browser.url, 'http://localhost');
				}
			},

			"whe creating a runner with args and getting the browser" : {
				topic : function() {
					return new Runner({url : "http://www.google.com", port : 8080,browser : 'chrome'});
				},
				" it should contain the proper tests" : function(runner) {
					var browser = runner.sodaClient;
					assert.equal(browser.host, 'localhost');
					assert.equal(browser.port, 8080);
					assert.equal(browser.browser, "*chrome");
					assert.equal(browser.url, 'http://www.google.com');
				}
			},

			/*"whe creating a runner with all passed in for suite " : {
				topic : function() {
					var runner = new Runner({url : "http://www.google.com",browser : 'firefox', testDir : __dirname + "/testFiles"});
					runner.run("all").then(comb.hitch(this, "callback", null), comb.hitch(this,"callback"));

				},
				" it should contain the proper tests" : function(res) {
					var args = comb.argsToArray(arguments);
					var successes = args[0], errors = args[1];
					console.log(errors);
					console.log(successes);
					//assert.deepEqual([{__dirname + "/testFiles/externalCommand.json" }, __dirname + "/testFiles/googleTest.json"], tests)
				}
			}

			"when creating a runner with all passed in for tests and suites " : {
				topic : function() {
					return new Runner({url : "http://www.google.com",browser : 'firefox', testDir : __dirname + "/testFiles"});
				},
				" it should contain the proper tests" : function(runner) {
					var tests = runner.run("all", "all");
					assert.deepEqual([__dirname + "/testFiles/externalCommand.json", __dirname + "/testFiles/googleTest.json"], tests)
				}
			},

			"whe creating a runner with all passed in for suite and googleTest for test " : {
				topic : function() {
					return new Runner({url : "http://www.google.com",browser : 'firefox', testDir : __dirname + "/testFiles"});
				},
				" it should contain the proper tests" : function(runner) {
					var tests = runner.run("all", ["googleTest"]);
					assert.deepEqual([__dirname + "/testFiles/googleTest.json"], tests)
				}
			},

			"whe creating a runner with all passed in for suite and a test with an external command " : {
				topic : function() {
					return new Runner({url : "http://www.google.com",browser : 'firefox', testDir : __dirname + "/testFiles"});
				},
				" it should contain the proper tests" : function(runner) {
					var tests = runner.run("all", ["externalCommand"]);
					assert.deepEqual([__dirname + "/testFiles/externalCommand.json"], tests);
				}
			}*/
		});
suite.run({reporter : require("vows").reporter.spec});