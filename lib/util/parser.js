var fs = require('fs'), path = require("path"), comb = require("comb"), logging = comb.logging, Logger = logging.Logger, Level = logging.Level;

var logger = Logger.getLogger("soda-runner.parser");
logger.level = Level.ALL;


var externFiles = {};

var openFile = function(fileName) {
	return fs.readFileSync(fileName, 'utf-8');
};

var isAbsolutePath = function(path) {
	return path && path.charAt(0) == "/";
};

var parseAndRunTest = function(data, browser) {
	var cwd = process.cwd();
	try {
		var arr = JSON.parse(data);
		if (arr && arr.length) {
			for (var i in arr) {
				var cmd = arr[i];
				if (cmd.command) {
					var c = cmd.command;
					var args = [];
					if (cmd.file) {
						var cmdFile = isAbsolutePath(cmd.file) ? cmd.file : cwd + "/" + cmd.file;
						!externFiles[cmdFile] && (externFiles[cmdFile] = require(cmdFile));
						var file = externFiles[cmdFile];
						if(file[cmd.fun]){
						args.push(file[cmd.fun].apply(file, cmd.args || []));
						}else{
							throw new Error(cmd.fun + " does not exist in cmdFile");
						}
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
		logger.error(e.stack);
	}
};

var runTest = function(fileName, browser) {
	var data = openFile(fileName);
	if (data) {
		parseAndRunTest(data, browser);
	}

};

exports.resolvePath = function(testDir, suite, test) {
	var ret = {};
	ret[suite] = {};
	testDir += suite ? "/" + suite.replace(/\./g, "/") : "";
	testDir += test ? "/" + test + ".json" : "";
	ret[suite][test] = testDir;
	return ret;
};

function canParse(fileName, mimeTypes) {
	var ext = path.extname(fileName).replace(".", "");
	return ext in mimeTypes;
};

exports.getAllTestsInDir = function(dirName, suiteName, mimeTypes) {
	var tests = {};
	dirName = dirName.replace(/\./g, "/");
	var stat;
	if (path.existsSync(dirName)) {
		stat = fs.statSync(dirName);
		if (stat && stat.isDirectory()) {
			/*  Create the directory where all our junk is moving to; read the mode of the source directory and mirror it */
			var files = fs.readdirSync(dirName);
			for (var i = 0; i < files.length; i++) {
				var currFileName = dirName + "/" + files[i];
				if (path.existsSync(currFileName)) {
					var currFile = fs.statSync(currFileName);
					if (currFile.isDirectory()) {
						tests[files[i]] = exports.getAllTestsInDir(currFileName, files[i], mimeTypes);
					} else if (canParse(currFileName, mimeTypes)) {
						tests[files[i]] = currFileName;
					}
				} else {
					logger.error("soda-runner : Directory '" + dirName + "' does not exist!");
				}
			}
		}
	} else {
		logger.error("soda-runner : Directory '" + dirName + "' does not exist!");
	}
	return tests;
};

exports.parse = function(fileNames, browser) {
	if (comb.isArray(fileNames)) {
		var string = comb.string;
		logger.info(string.style(string.format("Running %d tests", fileNames.length)));
		for (var i in fileNames) {
			runTest(fileNames[i], browser);
		}
	} else {
		runTest(fileNames, browser);
	}

}