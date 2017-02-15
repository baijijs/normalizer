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
  type = Array.isArray(type) ? type[0] : type;
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
  if (!opts) opts = {};
  if (Array.isArray(toType)) {
    assert(toType.length === 1, 'Multiple types converter is not allowed');

    // If we expect an array type and we received a string, parse it with JSON.
    // If that fails, parse it with the arrayItemDelimiters option.
    if (val && typeof val === 'string') {
      var parsed = false;
      if (val[0] === '[') {
        try {
          val = JSON.parse(val);
          parsed = true;
        } catch (e) { /* Do nothing */ }
      }
      if (!parsed && opts.arrayItemDelimiters) {
        val = val.split(opts.arrayItemDelimiters);
      }
    }

    if (!Array.isArray(val)) {
      if (val === undefined || val === '') {
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
 *   object
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
    case 'number':
      return Number.isNaN(val) ? false : val !== 0;
    default:
      return Boolean(val);
  }
});

/*!
 * Integer test regexp.
 */
var isInt = /^[0-9]+$/;

/*!
 * Float test regexp.
 */
var isFloat = /^([0-9]+)?\.[0-9]+$/;

function coerce(str) {
  if (typeof str !== 'string') return str;
  if ('undefined' === str) return undefined;
  if ('null' === str) return null;
  if ('true' === str) return true;
  if ('false' === str) return false;
  if (isFloat.test(str)) return parseFloat(str, 10);
  if (isInt.test(str) && str.charAt(0) !== '0') return parseInt(str, 10);
  return str;
}

// coerce every string in the given object / array
function coerceAll(obj, coerceLevel) {
  if (coerceLevel === 0) return obj;
  var type = Array.isArray(obj) ? 'array' : typeof obj;
  var i;
  var n;

  coerceLevel--;

  switch (type) {
    case 'string':
      return coerce(obj);
    case 'object':
      if (obj) {
        var props = Object.keys(obj);
        for (i = 0, n = props.length; i < n; i++) {
          var key = props[i];
          obj[key] = coerceAll(obj[key], coerceLevel);
        }
      }
      break;
    case 'array':
      for (i = 0, n = obj.length; i < n; i++) {
        coerceAll(obj[i], coerceLevel);
      }
      break;
  }

  return obj;
}

// convert object/any type
function convertAny(val, opts) {
  if (!opts) opts = {};
  // use maxCoerceLevel to prevent circular reference parse error
  var maxCoerceLevel = opts.maxCoerceLevel || 3;
  return coerceAll(val, maxCoerceLevel);
}

/**
 * object/any converter
 * object/any => object/any
 */
Normalizer.define('any', convertAny);
Normalizer.define('object', convertAny);
