'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isElement = require('./isElement');

var _isElement2 = _interopRequireDefault(_isElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (node) {
  if (!(0, _isElement2.default)(node)) {
    return document.documentElement;
  }

  var excludeStaticParent = node.style.position === 'absolute';
  var overflowRegex = /(scroll|auto)/;
  var parent = node;

  while (parent) {
    if (!parent.parentNode) {
      return node.ownerDocument || document.documentElement;
    }

    var style = window.getComputedStyle(parent);
    var position = style.position;
    var overflow = style.overflow;
    var overflowX = style['overflow-x'];
    var overflowY = style['overflow-y'];

    if (position === 'static' && excludeStaticParent) {
      parent = parent.parentNode;
      continue;
    }

    if (overflowRegex.test(overflow) && overflowRegex.test(overflowX) && overflowRegex.test(overflowY)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return node.ownerDocument || node.documentElement || document.documentElement;
}; /**
    * @fileOverview Find scroll parent
    */