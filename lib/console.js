'use strict';

const util = require('util');

function Console(stdout, stderr) {
  if (!(this instanceof Console)) {
    return new Console(stdout, stderr);
  }
  if (!stdout || typeof stdout.write !== 'function') {
    throw new TypeError('Console expects a writable stream instance');
  }
  if (!stderr) {
    stderr = stdout;
  }
  var prop = {
    writable: true,
    enumerable: false,
    configurable: true
  };
  prop.value = stdout;
  Object.defineProperty(this, '_stdout', prop);
  prop.value = stderr;
  Object.defineProperty(this, '_stderr', prop);
  prop.value = new Map();
  Object.defineProperty(this, '_times', prop);

  // bind the prototype functions to this Console instance
  var keys = Object.keys(Console.prototype);
  for (var v = 0; v < keys.length; v++) {
    var k = keys[v];
    this[k] = this[k].bind(this);
  }
}

Console.prototype.log = function() {
  this._stdout.write(util.format.apply(this, arguments) + '\n');
};


Console.prototype.info = Console.prototype.log;


Console.prototype.warn = function() {
  this._stderr.write(util.format.apply(this, arguments) + '\n');
};


Console.prototype.error = Console.prototype.warn;


Console.prototype.dir = function(object, options) {
  this._stdout.write(util.inspect(object, util._extend({
    customInspect: false
  }, options)) + '\n');
};


Console.prototype.time = function(timerName) {
  this._times.set(timerName, process.hrtime());
};


Console.prototype.timeEnd = function(timerName) {
  var time = this._times.get(timerName);
  if (!time) {
    throw new Error('No such timer name: ' + timerName);
  }
  const duration = process.hrtime(time);
  const ms = duration[0] * 1000 + duration[1] / 1e6;
  this.log('%s: %sms', timerName, ms.toFixed(3));
};


Console.prototype.trace = function trace() {
  // TODO probably can to do this better with V8's debug object once that is
  // exposed.
  var err = new Error();
  err.name = 'Trace';
  err.message = util.format.apply(this, arguments);
  Error.captureStackTrace(err, trace);
  this.error(err.stack);
};


Console.prototype.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, util.format.apply(this, arr));
  }
};


module.exports = new Console(process.stdout, process.stderr);
module.exports.Console = Console;
