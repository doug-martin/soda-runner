var soda = require('soda');

soda.addCommand = function(cmd){
    soda.prototype[cmd] = function(){
    // Queue the command invocation
    if (this.queue) {
      var args = Array.prototype.slice.call(arguments);
      return this.enqueue(cmd, args);
    // Direct call
    } else {
      var len = arguments.length
        , fn = arguments[len - 1]
        , args = Array.prototype.slice.call(arguments, 0, len - 1);
      return this.command(cmd, args, fn);
    }
  };
};

exports.soda = soda;