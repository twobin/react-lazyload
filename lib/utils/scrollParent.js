/**
 * @fileOverview Find scroll parent
 */

'use strict';

exports.__esModule = true;

exports['default'] = function (node) {
  if (!node) {
    return document;
  }

  var excludeStaticParent = node.style.position === 'absolute';
  var overflowRegex = /(scroll|auto)/;
  var parent = node;

  while (parent) {
    if (!parent.parentNode) {
      return node.ownerDocument || document;
    }

    var _parent$style = parent.style;
    var position = _parent$style.position;
    var overflow = _parent$style.overflow;
    var overflowX = _parent$style.overflowX;
    var overflowY = _parent$style.overflowY;

    if (position === 'static' && excludeStaticParent) {
      continue;
    }

    if (overflowRegex.test(overflow + overflowX + overflowY)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return node.ownerDocument || document;
};

module.exports = exports['default'];