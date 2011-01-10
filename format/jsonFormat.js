/**
 * Helper for developers to copy JSON from selenium,
 * add this format to Selenium IDE.
 */


/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
	source = JSON.parse(source);
	var commands = [];
    for(var i in source){
        var obj = source[i];
        if(typeof obj == 'object'){
            for(var j in obj){
                var cmd = obj[j];
                var command = new Command();
                command.command = j;
                command.target = cmd.target;
                command.value = cmd.value;
                commands.push(command);
            }
        }
    }
	testCase.commands = commands;
    return testCase;
}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands) {
	var cmds = [], len = commands.length;
    for (i = 0; i < len; i++) {
		var cmd = commands[i];
		cmds.push({command : cmd.command, target : cmd.target, value : cmd.value});
	}
	return JSON.stringify(cmds, null, 4);
}

/**
 * Format TestCase and return the source.
 * The 3rd and 4th parameters are used only in default HTML format.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {
   	return formatCommands(testCase.commands);
}
