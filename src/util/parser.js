var fs = require('fs');

var externFiles = {};

var openFile = function(fileName) {
    return fs.readFileSync(fileName, 'utf-8');
};

var parseAndRunTest = function(data, browser) {
    try {
        var arr = JSON.parse(data);
        if (arr && arr.length) {
            for (var i in arr) {
                var cmd = arr[i];
                if (cmd.command) {
                    var c = cmd.command;
                    var args = [];
                    if (cmd.file) {
                        !externFiles[cmd.file] && (externFiles[cmd.file] = require(cmd.file));
                        var file = externFiles[cmd.file];
                        args.push(file[cmd.fun].apply(file, cmd.args || []));
                    } else {
                        if (cmd.target) args.push(cmd.target);
                        if (cmd.value)  args.push(cmd.value);
                    }
                    if (browser[cmd.command]) {
                        browser[cmd.command].apply(browser, args);
                    } else {
                        throw new Error(cmd.command + " is not supported");
                    }
                }
            }

        }
    } catch(e) {
        console.log(e.message, e.stack);
    }
};

var runTest = function(fileName, browser) {
    //try {
    var data = openFile(fileName);
    if (data) {
        parseAndRunTest(data, browser);
    }
    /*} catch(e) {
     console.log(e.toString())
     throw new Error("Error opening " + fileName + " test", e);
     }*/
}

exports.parse = function(fileNames, browser) {
    console.log(' \x1b[33mRunning %s tests\x1b[0m', fileNames.length);
    for (var i in fileNames) {
        console.log(' \x1b[33m%s\x1b[0m', fileNames[i]);
        runTest(fileNames[i], browser);
    }

}