var soda = require('./sodaWrapper').soda,
		comb = require("comb"),
		logging = comb.logging,
		Logger = logging.Logger,
		Level = logging.Level,
		string = comb.string,
		parser = require('./util/parser');

var logger = Logger.getLogger("soda-runner");
logger.level = Level.ALL;


soda.addCommand('wait');
soda.addCommand('assertTextNotPresent');
soda.addCommand('refreshAndWait');

var getAllTestsInDir = parser.getAllTestsInDir, resolvePath = parser.resolvePath;
var gatherTestFiles = function(tests, suite, testDir, mimeTypes) {
	var testFiles = {};
	if (!tests) tests = "all";
	if (tests == 'all' && suite == "all") {
		testFiles = getAllTestsInDir(testDir, suite, mimeTypes)
	} else {
		suite == "all" && (suite = null);
		if (tests == "all") {
			if (suite == "all") suite = null;
			if (suite && suite instanceof Array) {
				suite.forEach(function(s) {
					testFiles[s] = getAllTestsInDir(testDir + '/' + s, s, mimeTypes);
				}, this);
			} else if (suite) {
				testFiles[suite] = getAllTestsInDir(testDir + '/' + suite, suite, mimeTypes);
			} else {
				testFiles = getAllTestsInDir(testDir, "all", mimeTypes);
			}
		} else {
			if (tests instanceof Array) {
				testFiles = tests.map(function(t) {
					return resolvePath(testDir, suite, t);
				}, this);
			} else {
				testFiles = resolvePath(testDir, suite, tests);
			}
		}
	}
	return testFiles;
};

var runTests = function(browser, testFiles, baseUrl, timeout) {
	var ret = new comb.Promise();
	browser.chain.session()
			.setTimeout(timeout)
			.windowMaximize()
			.open(baseUrl);
	parser.parse(testFiles, browser);
	browser.testComplete()
			.end(function(err) {
				if (err) {
					logger.error(err.message);
					ret.errback(err.message);
				} else {
					ret.callback("All tests passed");
				}
			});
	return ret;
};

/**
 * @class Wrapper for soda clients to allow the running of a suite of tests.
 *
 * <p><b>NOTE : Selenium RC should already be running!</b></p>
 *
 * @example
 *
 * //default parameters
 * // client - Runner.LOCAL
 * // url - http://localhost
 * // browser - firefox
 * // max-duration : 300
 * // port - 4444
 * // host - localhost
 * var runner = new Runner();
 *
 * //or
 *
 * var runner = new Runner({
 *     testDir : ".", //location of tests
 *     client : Runner.LOCAL, //use the SAUCE client
 *     baseUrl : "/home", //the initial url to hit with the browser
 *     timeout : 0, //longest time to wait for a command
 *     maxDuration : 100, //in seconds
 *     port : 80, //port selenium rc is running on
 *     host : "ondemand.saucelabs.com", //the sauce host
 *     url : "http://your.saucerc.server.com", //the url of the sauce client
 *     browser : "firefox",         Browser name, ex "firefox"
 * });
 *
 * //or
 *
 * var runner = new Runner({
 *     testDir : ".", //my tests are in the current directory
 *     client : Runner.SAUCE, //use the SAUCE client
 *     baseUrl : "/home", //the initial url to hit with the browser
 *     timeout : 0, //longest time to wait for a command
 *     maxDuration : 100, //in seconds
 *     port : 80, //port selenium rc is running on
 *     host : "ondemand.saucelabs.com", //the sauce host
 *     url : "http://your.saucerc.server.com", //the url of the sauce client
 *     username : "myuser",        // Saucelabs username
 *     accessKey : "10234852oasfjs", //      Account access key
 *     os : "Linux",             Operating system ex "Linux"
 *     browser : "google-chrome",         Browser name, ex "firefox"
 *     browserVersion : 10, //Browser version, ex "3.0.", "7."
 * });
 *
 * @param {Object} [options] provide to override defaults
 * @param {Boolean} [options.logCommands=true] set to false to not log commands sent to the server.
 * @param {Boolean} [options.stopOnError=false] Set to true to prevent tests from running after a failure.
 * @param {String} [options.testDir] the location of the tests
 * @param {String} [options.baseUrl] the url to initially open the browser to
 * @param {Number} [options.timeout] max time to wait for a command to execute
 * @param {Number} [options.maxDuration] the maximum time to wait for a test to complete in seconds
 * @param {Object} [options.mimeTypes={json : 1}] the file extensions to look for tests to end with.
 *                                                <b>ALL FILES WILL BE PARSED AS JSON</b>
 * @param {Number} [options.port=4444] the port that the selenium rc is running on.
 * @param {String} [options.host="localhost"] the host of the rc server is running on
 * @param {String} [options.url="http://localhost"] the url of the site being tested
 * @param {Runner.LOCAL|Runner.SAUCE} client the type of client to use
 * @param {String} [options.browser="firefox"] the browser to run the tests in.
 * @param {String} [options.username] the name of the user to authenticate with.
 *                                    <b> only used if options.client is set to Runner.SAUCE</b>
 * @param {String} [options.accessKey] the access key of the user.
 *                                    <b> only used if options.client is set to Runner.SAUCE</b>
 * @param {String} [options.os] The os to run the test on
 *                                    <b> only used if options.client is set to Runner.SAUCE</b>
 * @param {String} [options.browserVersion] The version of the browser to use.
 *                                    <b> only used if options.client is set to Runner.SAUCE</b>
 *
 * @name Runner
 *
 * @property {Boolean} logCommands set to false to not log commands sent to the server.
 * @property {Boolean} stopOnError Set to true to prevent tests from running after a failure.
 * @property {String} testDir the location of the tests
 * @property {String} baseUrl the url to initially open the browser to
 * @property {Number} timeout max time to wait for a command to execute
 * @property {Number} maxDuration the maximum time to wait for a test to complete in seconds
 * @property {Object} mimeTypes the file extensions to look for tests to end with.
 *                                                <b>ALL FILES WILL BE PARSED AS JSON</b>
 * @property {Number} port the port that the selenium rc is running on.
 * @property {String} host the host of the rc server is running on
 * @property {String} url the url of the site being tested
 * @property {String} client the type of client to use
 * @property {String} browser the browser to run the tests in.
 * @property {String} username the name of the user to authenticate with.
 *                    <b> only used if the client is set to Runner.SAUCE</b>
 * @property {String} accessKey the access key of the user.
 *                    <b> only used if the client is set to Runner.SAUCE</b>
 * @property {String} os The os to run the test on
 *                    <b> only used if the client is set to Runner.SAUCE</b>
 * @property {String} browserVersion The version of the browser to use.
 *                    <b> only used if the client is set to Runner.SAUCE</b>
 * @property {soda.Client} sodaClient Soda client to run tests, once this property is retrieved it is not created again!
 *                    <b>All properties are read only after the client has been retrieved</b>
 */
var Runner = (exports = module.exports = comb.define(null, {
			instance : {
				/**@lends Runner.prototype*/

				__browser : null,

				__props : null,

				testDir : "tests",

				baseUrl : "/",

				stopOnError : false,

				timeout : 30000,

				mimeTypes : {json : 1},

				logCommands : true,

				_log : function(cmd, args) {
					if (args && args.length) {
						logger.debug(string.format("COMMAND - %[- 30]s : %s", string.style(cmd, ["yellow"]), string.style(args, ["white"]).join(", ")));
					} else {
						logger.debug(string.format("COMMAND - %[- 30]s", string.style(cmd, ["yellow"])));
					}
				},

				constructor : function(options) {
					this.__props = {};
					var defaults = comb.merge({
								client :  Runner.LOCAL,
								browser : "firefox",
								maxDuration : 300,
								port : 4444,
								host : "localhost"
							}, options || {});
					comb.merge(this, defaults);
				},

				__runTests : function(testFiles) {
					var promise = new comb.Promise();
					var responses = null, errors = null;
					var keys = [];
					for (var i in testFiles) {
						keys.push(i);
					}
					var count = 0, length = keys.length;
					if (keys.length) {
						var next = comb.hitch(this, function(res, err) {
							//reset my browser so I can get another.
							this.__browser = null;
							if (res) {
								!responses && (responses = {});
								//if i have a response record it!
								responses[keys[count - 1]] = res;
							}
							if (err) {
								!errors && (errors = {});
								errors[keys[count - 1]] = err;
							}
							if (count == length) {
								//looped through all my tests so callback
								promise.callback(responses, errors);
							} else if (count < length) {
								//call the next test!
								var key = keys[count++], file = testFiles[key], p;
								if (typeof file == "object") {
									this.__runTests(file).then(next);
								} else {
									if (this.logCommands) {
										logger.info(string.style("RUNNING: ", ["green", "bold", "underline"]) + string.style(key, ["yellow"]));
									}
									runTests(this.sodaClient, file, this.baseUrl, this.timeout).then(comb.hitch(this, next), comb.hitch(this, next, null));
								}
							}
						});
						//start the loop!
						next();
					} else {
						promise.callback("NO TESTS FOUND!");
					}
					return promise;
				},

				/**
				 * Runs a suite of tests.
				 * @param {String|Array} [suites="all"] the suites to run.
				 *  <ul>
				 *      <li>Suites can be dot separated i.e. suite.subSuite.subSuite2.</li>
				 *      <li>If suites is an Array then all tests are gathered from each suite</li>
				 *      <li>If suites is specified and tests are specified then it is assumed
				 *          that the user is only specifying tests in that suite!</li>
				 *  </ul>
				 * @param {String|Array} [tests="all"] the tests to run.
				 */
				run : function(suites, tests) {
					var testFiles = gatherTestFiles(tests, suites, this.testDir, this.mimeTypes), ret;
					logger.debug(string.format("%4j", [testFiles]));
					ret = this.__runTests(testFiles);

					return ret;
				},

				getters : {

					sodaClient : function() {
						var browser = this.__browser;
						if (!browser) {
							var args = this.__props, client;
							if ((client = soda[args.client])) {
								browser = client(args);
								// Log commands as they are fired
								if (this.logCommands) {
									browser.on('command', comb.hitch(this, "_log"));
								}
							} else {
								throw new Error("Client of type '" + this.client + "' is not supported!");
							}
							this.__browser = browser;
						}
						return browser;
					},

					client :  function() {
						return this.__props.client;
					},

					host :  function() {
						return this.__props.host;
					},
					port :  function() {
						return this.__props.port;
					},
					browser :  function() {
						return this.__props.browser;
					},
					url :  function() {
						return this.__props.url;
					},
					username :  function() {
						return this.__props.username;
					},
					accessKey :  function() {
						return this.__props["access-key"];
					},
					os :  function() {
						return this.__props.os;
					},
					browserVersion :  function() {
						return this.__props["browser-version"];
					},
					maxDuration :  function() {
						return this.__props["max-duration"];
					}

				},

				setters : {
					host :  function(prop) {
						if (!comb.isString(this.__props.url)) {
							this.url = comb.string.format("http://%s", prop);
						}
						this.__props.host = prop;
					},

					client :  function(prop) {
						if (prop == Runner.LOCAL || prop == Runner.SAUCE) {
							this.__props.client = prop;
						} else {
							throw "soda-runner : Invalid client";
						}
					},

					port :  function(prop) {
						this.__props.port = prop;
					},
					browser :  function(prop) {
						this.__props.browser = prop;
					},
					url :  function(prop) {
						this.__props.url = prop;
					},
					username :  function(prop) {
						this.__props.username = prop;
					},
					accessKey :  function(prop) {
						this.__props["access-key"] = prop;
					},
					os :  function(prop) {
						this.__props.os = prop;
					},
					browserVersion :  function(prop) {
						this.__props["browser-version"] = prop;
					},
					maxDuration :  function(prop) {
						this.__props["max-duration"] = prop;
					}
				}
			},
			static : {
				LOCAL : "createClient",
				SAUCE : "createSauceClient"
			}
		}));

