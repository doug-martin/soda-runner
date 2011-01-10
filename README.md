
# soda-runner

 A runner for SodaJS to allow developers to define tests in SelniumIDE using the formatter located in /formatter.
 The formatter allows one to save tests between the IDE into a corresponding json file that soda-runner can run.

## Installation

    npm install soda-runner

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

## Selenium IDE Formatter

To use the fomatter in selenium IDE open selenium:

* Click "Options"
* Select "Options"
* Select "Formats"
* Click "Add"
* name the format i.e. : JSON
* Paste jsonFormat.js
* click "Save"
* click "Ok"
* Click "Options"
* Hover over "Format" and select JSON (or whatever your named it)
* Hover over "Clipboard format" and select JSON (or whatever your named it)

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

    var Runner = require('soda-runner'),
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("all", ["googleTest"]);

## External Commands

External commands can be used to specify a commonly used piece of code, your define them just as your would for sodaJS

testHelper.js

    exports.assertTitle = function(title)
    {
        return function(browser) {
            browser.getTitle(function(title) {
                assert.ok(~title.indexOf(title), 'Title did not include the query');
            });
        }
    }

To reference the command in the json test use the following format

    {
        "command" : "and",
        "file" : "testHelper.js",
        "fun" : "assertTitle",
        "args" : ["hello world"]
    }

the file parameter can either be an absolute or relative to the location of where the originating node script was
ran from so if your directory look like this:

    - tests
        -util
            -testHelper.js
        - internal
            - googleTest.json
            - googleTest2.json
            - googleTest3.json
        - external
            - externalCommands.json

and you ran

    soda-runner suite=external testDir=tests

from the same directory thats tests resides in then

    {
        "command" : "and",
        "file" : "tests/util/testHelper.js",
        "fun" : "assertTitle",
        "args" : ["hello world"]
    }

could be used to specify the location of the testHelper.js script

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


test.js

    var Runner = require('soda-runner'),
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("all", ["externalCommand"]);

To run all tests in a directory

    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("all");

To run all tests in a directory

   var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
   var tests = runner.run("all", ["googleTest", "externalCommands"]);


##Define a suite
If you want to define a particular suite, create a directory in your base test directory, i.e:

    - tests
        - internal
            - googleTest.json
            - googleTest2.json
            - googleTest3.json
        - external
            - externalCommands.json

To run the internal suite

    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("internal");

To run a particular tests in a suite
    var runner = new Runner({url : "http://www.google.com",browserType : 'firefox', testDir : __dirname + "/tests"});
    var tests = runner.run("internal", ["googleTest, "googleTest3]);


## Command line

    soda-runner suite=all tests=test1,test2,.... testDir=locationOfTests url=url browser=browserType

executing inner suites

    soda-runner suite=suite.innerSuite tests=test1,test2,.... testDir=locationOfTests url=url browser=browserType


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