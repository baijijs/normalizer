/**
 * Expose `Normalizer`.
 */
module.exports = Normalizer;

/*!
 * Module dependencies.
 */
var assert = require('assert');

/**
 * @class
 * Create a normalizer value from the given value.
 *
 * @param {*} val The value object
 * @param {Object} opts The Options
 */
function Normalizer(val, opts) {
  this.val = val;
  this.opts = opts;
}

/*!
 * Object containing converter functions.
 */
Normalizer.converters = {};

/**
 * Define a named type conversion. The conversion is used when a
 * `ApiMethod` argument defines a type with the given `name`.
 *
 * ```js
 * Normalizer.define('MyType', function(val, opts) {
 *   // use the val and opts objects to return the concrete value
 *   return new MyType(val);
 * });
 * ```
 *
 * @param {String} name The type name
 * @param {Function} converter
 */
Normalizer.define = function(name, converter) {
  this.converters[name] = converter;
};

/**
 * undefine a converter via its name
 */
Normalizer.undefine = function(name) {
  delete this.converters[name];
};

/**
 * Is the given type supported.
 *
 * @param {String} type
 * @returns {Boolean}
 */
Normalizer.canConvert = function(type) {
  return !!this.getConverter(type);
};

/**
 * Get converter by type name.
 *
 * @param {String} type
 * @returns {Function}
 */
Normalizer.getConverter = function(type) {
  return this.converters[type];
};

/**
 * Shortcut method for convert value
 *
 * @param {String} val
 * @param {String} type
 * @param {Object} opts
 * @returns {Object}
 */
Normalizer.convert = function(val, toType, opts) {
  if (Array.isArray(toType)) {
    assert(toType.length === 1, 'Multiple types converter is not allowed');
    if (!Array.isArray(val)) {
      if (val === undefined) {
        val = [];
      } else {
        val = [val];
      }
    }

    return Normalizer.convert(val, toType[0], opts);
  }

  if (Array.isArray(val)) {
    return val.map(function(v) {
      return Normalizer.convert(v, toType, opts);
    });
  }
  return (new Normalizer(val, opts)).to(toType);
};

/**
 * Convert the normalizer value to the given type.
 *
 * @param {String} type
 * @returns {*} The concrete value
 */
Normalizer.prototype.to = function(type) {
  var converter = this.constructor.getConverter(type);
  assert(converter, 'No Type converter defined for ' + type);
  return converter(this.val, this.opts);
};

/**
 * Built in type converters...
 *   number
 *   date
 *   string
 *   boolean
 *   any
 */

/**
 * number converter
 * undefined => undefined
 * '' => null
 * null => null
 * Number(val)
 */
Normalizer.define('number', function convertNumber(val) {
  if (val === undefined || val === null || typeof val === 'number') return val;
  if (val === '') return null;
  return Number(val);
});

/**
 * date converter
 * undefined => undefined
 * null => null
 * new Date(val)
 */
Normalizer.define('date', function convertDate(val) {
  if (val === undefined || val === null || val instanceof Date) return val;
  return new Date(val);
});

/**
 * string converter
 * undefined => undefined
 * null => null
 * String(val)
 */
Normalizer.define('string', function convertString(val) {
  if (val === undefined || val === null || typeof val === 'string') return val;
  return String(val);
});

/**
 * boolean converter
 * undefined => undefined
 * Boolean(val)
 */
Normalizer.define('boolean', function convertBoolean(val) {
  switch (typeof val) {
    case 'undefined':
      return undefined;
    case 'string':
      switch (val) {
        case 'undefined':
        case 'null':
        case 'false':
        case '0':
        case '':
          return false;
        default:
          return true;
      }
      break;
    case 'number':
      return Number.isNaN(val) ? false : val !== 0;
    default:
      return Boolean(val);
  }
});

/**
 * any converter
 * any => any
 */
Normalizer.define('any', function convertAny(val) {
  return val;
});
