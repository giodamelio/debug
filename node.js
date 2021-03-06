
/**
 * Module dependencies.
 */

var tty = require('tty');
var util = require('util');

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
  if (0 === debugColors.length) {
    return tty.isatty(1);
  } else {
    return '0' !== debugColors
        && 'no' !== debugColors
        && 'false' !== debugColors
        && 'disabled' !== debugColors;
  }
}

/**
 * Map %o to `util.inspect()`, since Node doesn't do that out of the box.
 */

exports.formatters.o = function(v) {
  return util.inspect(v, { colors: this.useColors })
    .replace(/\s*\n\s*/g, ' ');
};

/**
 * Invokes `console.log()` with the specified arguments,
 * after adding ANSI color escape codes if enabled.
 *
 * @api public
 */

function log() {
  var args = arguments;
  var useColors = this.useColors;
  var name = this.namespace;

  if (useColors) {
    var c = this.color;

    args[0] = '  \u001b[9' + c + 'm' + name
      + '\u001b[0m' + '\u001b[3' + c + 'm'
      + ' +' + exports.humanize(this.diff) + '\u001b[0m'
      + ' ' + args[0];
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }

  console.log.apply(console, args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  process.env.DEBUG = namespaces;
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());
