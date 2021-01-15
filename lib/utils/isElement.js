"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 *  @fileOverview Checks node to be an HTMLElement
 */

var isElement = function isElement(node) {
  return node instanceof HTMLElement;
};

exports.default = isElement;