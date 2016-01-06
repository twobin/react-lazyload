"use strict";

exports.__esModule = true;
exports.debounce = debounce;
exports.throttle = throttle;

function debounce(func, wait, immediate) {
  var timeout = undefined,
      args = undefined,
      context = undefined,
      timestamp = undefined,
      result = undefined;

  var later = function later() {
    var last = +new Date() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = +new Date();

    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

function throttle(func, wait) {
  var call = false;
  return function () {
    if (!call) {
      func.call();
      call = true;

      setTimeout(function () {
        call = false;
      }, wait);
    }
  };
}