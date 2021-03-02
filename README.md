Baiji Normalizer
================

[![Build Status](https://travis-ci.org/baijijs/normalizer.svg)](https://travis-ci.org/baijijs/normalizer)

A smart value type converter for Baiji

# Usage

## Installation

```bash
npm install baiji-normalizer
```

## Convert value

``` javascript
// Built-in Types
// number, string, date, boolean, object, any


var Normalizer = require('baiji-normalizer');

// Number
Normalizer.convert('1', 'number')       // => 1
Normalizer.convert(1, 'number')         // => 1
Normalizer.convert('', 'number')        // => null
Normalizer.convert(undefined, 'number') // => undefined
Normalizer.convert(null, 'number')      // => null

// String
Normalizer.convert('1', 'string')       // => '1'
Normalizer.convert(1, 'string')         // => '1'
Normalizer.convert('', 'string')        // => ''
Normalizer.convert(undefined, 'string') // => undefined
Normalizer.convert(null, 'string')      // => null

// Date
Normalizer.convert('1', 'date')       // => Thu Jan 01 1970 08:00:00 GMT+0800 (CST)
Normalizer.convert(1, 'date')         // => Thu Jan 01 1970 08:00:00 GMT+0800 (CST)
Normalizer.convert('', 'date')        // => Invalid Date
Normalizer.convert(undefined, 'date') // => undefined
Normalizer.convert(null, 'date')      // => null

// Boolean
Normalizer.convert(undefined, 'boolean')     // => undefined
Normalizer.convert('1', 'boolean')           // => true
Normalizer.convert(1, 'boolean')             // => true
Normalizer.convert(0, 'boolean')             // => false
Normalizer.convert(NaN, 'boolean')           // => false
Normalizer.convert('', 'boolean')            // => false
Normalizer.convert('undefined', 'boolean')   // => false
Normalizer.convert('null', 'boolean')        // => false
Normalizer.convert('0', 'boolean')           // => false
Normalizer.convert(null, 'boolean')          // => false

// Handle array type
Normalizer.convert(1, ['number'])          // => [1]
Normalizer.convert(true, ['boolean'])      // => [true]
```

## Add new or overwrite existing converter

``` javascript
var Normalizer = require('baiji-normalizer');

// add new
Normalizer.define('regexp', function(val, opts) {
  if (val === undefined || val === null || val instanceof RegExp) return val;
  val = String(val);
  return new RegExp(val.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
});

// overwrite existing
Normalizer.define('boolean', function(val, opts) {
  return Boolean(val);
});
```

## Other APIs

```bash

# Normalizer.undefine(type, converterFn) => undefine a converter
# Normalizer.canConvert(type)            => check if a type can be converted
# Normalizer.getConverter(type)          => get a specific converter
# Normalizer.convertArray(val, opts)          => convert val to array
```

# License

* The MIT license
