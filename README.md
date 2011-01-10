
# soda-runner

 A runner for SodaJS to allow developers to define tests in SelniumIDE using the formatter located in /formatter.
 The formatter allows one to save tests between the IDE into a corresponding json file that soda-runner can run.

## Runner Options

    /*testDir - the base directory where your tests are located
    client - the client to create 'client' or 'sauceClient'
    port - defaults to 4444
    host - the location of the rc server defaults to locahost
    url - the url of the site your are testing
    browserType - ie firefox
    baseUrl - the url to open the browser to initially
    mimeTypes - supported mimetype, do not change this, here to support multiple times in the future*/

    var runner = new Runner(options);

## Native Commands

googleTest.json

    [
        {
            "command":"type",
            "target":"q",
            "value":"hello world"
        },
        {
            "command" : "setSpeed",
            "target" : "1000"
        },
        {
            "command":"click",
            "target":"btnG",
            "value":""
        },
        {
            "command" : "setSpeed",
            "target" : "10"
        },
        {
            "command":"waitForElementPresent",
            "target":"sflas",
            "value":""
        },
        {
            "command":"clickAndWait",
            "target":"sflas",
            "value":""
        },
        {
            "command":"assertValue",
            "target":"as_q",
            "value":"hello world"
        }
    ]

test.js

    var Runner = require('../index.js'),
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("all", ["googleTest"]);

## External Commands

externalCommands.json

    [
        {
            "command":"type",
            "target":"q",
            "value":"hello world"
        },
        {
            "command" : "setSpeed",
            "target" : "1000"
        },
        {
            "command":"click",
            "target":"btnG",
            "value":""
        },
        {
            "command" : "and",
            "file" : "../../test/testHelper",
            "fun" : "assertTitle",
            "args" : ["hello world"]
        },
        {
            "command":"waitForElementPresent",
            "target":"sflas",
            "value":""
        },
        {
            "command" : "setSpeed",
            "target" : "10"
        },
        {
            "command":"clickAndWait",
            "target":"sflas",
            "value":""
        },
        {
            "command":"assertValue",
            "target":"as_q",
            "value":"hello world"
        }
    ]



## testHelper.js

    exports.assertTitle = function(title)
    {
        return function(browser) {
            browser.getTitle(function(title) {
                assert.ok(~title.indexOf(title), 'Title did not include the query');
            });
        }
    }

test.js

    var Runner = require('../index.js'),
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
    var tests = runner.run("all", ["externalCommand"]);

To run all tests in a directory

    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
    var tests = runner.run("all");

To run all tests in a directory

   var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
   var tests = runner.run("all", ["googleTest", "externalCommands"]);

If you want to define a particular suite, create a directory in your base test directory, i.e:

    - Tests
        - internal
            - googleTest.json
            - googleTest2.json
            - googleTest3.json
        - external
            - externalCommands.json

To run the internal suite

    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
    var tests = runner.run("internal");

To run a particular tests in a suite
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/testFiles"});
    var tests = runner.run("internal", ["googleTest, "googleTest3]);


## Command line

    node test.js suite=all tests=test1,test2,.... testDir=locationOfTests url=url browser=browserType

executing inner suites

    node test.js suite=suite.innerSuite tests=test1,test2,.... testDir=locationOfTests url=url browser=browserType


## More Information

  -  [SodaJS](https://github.com/learnboost/soda)


## License

(The MIT License)

Copyright (c) 2010 LearnBoost &lt;dev@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.