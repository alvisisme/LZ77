(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("lz77", [], factory);
	else if(typeof exports === 'object')
		exports["lz77"] = factory();
	else
		root["lz77"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// - - -
// # LZ77
// ** A minimal LZ77 [de]compressor **
// let LZ77;
// ##### Private Variables
var self = {},
    settings = {
  refPrefix: '`',
  refIntBase: 96,
  refIntFloorCode: ' '.charCodeAt(0),
  refIntCeilCode: undefined,
  maxStringDistance: undefined,
  minStringLength: 5,
  maxStringLength: undefined,
  defaultWindow: 144,
  maxWindow: undefined,
  windowLength: undefined
};

// ##### Public Variables

// ##### Private Methods
// #### each()
// >`@param obj [collection]` our source collection
// >`@param iterator [function]` the function that will be called for each element in the collection
// >`@param context [object]` the context our iterator should operate within
//
// essentially copied from underscore.js
var each = function each(obj, iterator, context) {
  var breaker = {};

  if (obj === null) {
    return;
  }
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) {
        return;
      }
    }
  } else {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return;
        }
      }
    }
  }
};

// #### extend()
// >`@param obj [object]` our destination object
// >`@params * [object(s)]` objects that will overwrite the data in the destination object, in order
//
// essentially copied from underscore.js
var extend = function extend(obj) {
  each(Array.prototype.slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

var setup = function setup(params) {
  params = params || {};
  settings = extend(settings, params);

  settings.refIntCeilCode = settings.refIntFloorCode + settings.refIntBase - 1;
  settings.maxStringDistance = Math.pow(settings.refIntBase, 2) - 1;
  settings.maxStringLength = Math.pow(settings.refIntBase, 1) - 1 + settings.minStringLength;
  settings.maxWindow = settings.maxStringDistance + settings.minStringLength;
};

var encodeRefInt = function encodeRefInt(value, width) {
  if (value >= 0 && value < Math.pow(settings.refIntBase, width) - 1) {
    var encoded = '';

    while (value > 0) {
      encoded = String.fromCharCode(value % settings.refIntBase + settings.refIntFloorCode) + encoded;
      value = Math.floor(value / settings.refIntBase);
    }
    var missingLength = width - encoded.length;
    var i = 0;

    for (; i < missingLength; i++) {
      encoded = String.fromCharCode(settings.refIntFloorCode) + encoded;
    }
    return encoded;
  }
  throw new Error('Reference int out of range: ' + value + ' (width = ' + width + ')');
};

var encodeRefLength = function encodeRefLength(length) {
  return encodeRefInt(length - settings.minStringLength, 1);
};

var decodeRefInt = function decodeRefInt(data, width) {
  var value = 0,
      charCode = void 0,
      i = 0;
  for (; i < width; i++) {
    value *= settings.refIntBase;
    charCode = data.charCodeAt(i);
    if (charCode >= settings.refIntFloorCode && charCode <= settings.refIntCeilCode) {
      value += charCode - settings.refIntFloorCode;
    } else {
      throw new Error('Invalid char code in reference int: ' + charCode);
    }
  }
  return value;
};

var decodeRefLength = function decodeRefLength(data) {
  return decodeRefInt(data, 1) + settings.minStringLength;
};

// ##### Public Methods

// #### LZ77.compress()
// >`@param source [string]` the source string we will be compressing
// >`@param params [object]` this allows us to overwrite defaults at call-time
//
// This is our compression method, taking the input string (and allowing for call-time
// paramters) and returning the compressed representation
self.compress = function (source, params) {
  if (Object.prototype.toString.call(source) !== '[object String]') {
    return false;
  }

  setup(params);

  var windowLength = settings.windowLength || settings.defaultWindow;

  if (windowLength > settings.maxWindow) {
    throw new Error('Window length too large');
  }

  var compressed = '',
      pos = 0,
      lastPos = source.length - settings.minStringLength;

  while (pos < lastPos) {
    var searchStart = Math.max(pos - windowLength, 0),
        matchLength = settings.minStringLength,
        foundMatch = false,
        bestMatch = {
      distance: settings.maxStringDistance,
      length: 0
    },
        newCompressed = null,
        isValidMatch = void 0,
        realMatchLength = void 0;

    while (searchStart + matchLength < pos) {
      isValidMatch = source.substr(searchStart, matchLength) === source.substr(pos, matchLength) && matchLength < settings.maxStringLength;
      if (isValidMatch) {
        matchLength++;
        foundMatch = true;
      } else {
        realMatchLength = matchLength - 1;
        if (foundMatch && realMatchLength > bestMatch.length) {
          bestMatch.distance = pos - searchStart - realMatchLength;
          bestMatch.length = realMatchLength;
        }
        matchLength = settings.minStringLength;
        searchStart++;
        foundMatch = false;
      }
    }

    if (bestMatch.length) {
      newCompressed = settings.refPrefix + encodeRefInt(bestMatch.distance, 2) + encodeRefLength(bestMatch.length);
      pos += bestMatch.length;
    } else {
      if (source.charAt(pos) !== settings.refPrefix) {
        newCompressed = source.charAt(pos);
      } else {
        newCompressed = settings.refPrefix + settings.refPrefix;
      }
      pos++;
    }
    compressed += newCompressed;
  }

  return compressed + source.slice(pos).replace(/`/g, '``');
};

// #### LZ77.decompress()
// >`@param source [string]` the source string of compressed data
// >`@param params [object]` this allows us to overwrite defaults at call-time
//
// decompression method, taking the compressed data (as a string, and allowing for
// call-time paramters) and returning the decompressed data
self.decompress = function (source, params) {
  if (Object.prototype.toString.call(source) !== '[object String]') {
    return false;
  }

  var decompressed = '',
      pos = 0,
      currentChar = void 0,
      nextChar = void 0,
      distance = void 0,
      length = void 0;

  setup(params);
  while (pos < source.length) {
    currentChar = source.charAt(pos);
    if (currentChar !== settings.refPrefix) {
      decompressed += currentChar;
      pos++;
    } else {
      nextChar = source.charAt(pos + 1);
      if (nextChar !== settings.refPrefix) {
        distance = decodeRefInt(source.substr(pos + 1, 2), 2);
        length = decodeRefLength(source.charAt(pos + 3));
        decompressed += decompressed.substr(decompressed.length - distance - length, length);
        pos += settings.minStringLength - 1;
      } else {
        decompressed += settings.refPrefix;
        pos += 2;
      }
    }
  }
  return decompressed;
};

exports.default = self;
module.exports = exports['default'];

/***/ })
/******/ ]);
});
//# sourceMappingURL=lz77.js.map