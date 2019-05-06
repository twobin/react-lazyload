'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forceCheck = exports.lazyload = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _event = require('./utils/event');

var _scrollParent = require('./utils/scrollParent');

var _scrollParent2 = _interopRequireDefault(_scrollParent);

var _debounce = require('./utils/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _throttle = require('./utils/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _decorator = require('./decorator');

var _decorator2 = _interopRequireDefault(_decorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * react-lazyload
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var defaultBoundingClientRect = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0
};
var LISTEN_FLAG = 'data-lazyload-listened';

var listeners = {};
var pendings = {};

// try to handle passive events
var passiveEventSupported = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      passiveEventSupported = true;
    }
  });
  window.addEventListener('test', null, opts);
} catch (e) {}
// do nothing here

// if they are supported, setup the optional params
// IMPORTANT: FALSE doubles as the default CAPTURE value!
var passiveEvent = passiveEventSupported ? { capture: false, passive: true } : false;

/**
 * Check if `component` is visible in overflow container `parent`
 * @param  {node} component React component
 * @param  {node} parent    component's scroll parent
 * @return {bool}
 */
var checkOverflowVisible = function checkOverflowVisible(component, parent) {
  var node = _reactDom2.default.findDOMNode(component);

  var parentTop = void 0;
  var parentHeight = void 0;

  var parentWidth = void 0;
  var parentLeft = void 0;

  try {
    var _parent$getBoundingCl = parent.getBoundingClientRect();

    parentTop = _parent$getBoundingCl.top;
    parentHeight = _parent$getBoundingCl.height;
    parentWidth = _parent$getBoundingCl.width;
    parentLeft = _parent$getBoundingCl.left;
  } catch (e) {
    parentTop = defaultBoundingClientRect.top;
    parentHeight = defaultBoundingClientRect.height;
    parentWidth = defaultBoundingClientRect.width;
    parentLeft = defaultBoundingClientRect.left;
  }

  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  var windowInnerWidth = window.innerWidth || document.documentElement.clientWidth;

  // calculate top and height of the intersection of the element's scrollParent and viewport
  var intersectionTop = Math.max(parentTop, 0); // intersection's top relative to viewport
  var intersectionHeight = Math.min(windowInnerHeight, parentTop + parentHeight) - intersectionTop; // height

  var intersectionLeft = Math.max(parentLeft, 0);
  var intersectionWidth = Math.min(windowInnerWidth, parentLeft + parentWidth) - intersectionLeft;

  // check whether the element is visible in the intersection
  var top = void 0;
  var height = void 0;

  var width = void 0;
  var left = void 0;

  try {
    var _node$getBoundingClie = node.getBoundingClientRect();

    top = _node$getBoundingClie.top;
    height = _node$getBoundingClie.height;
    width = _node$getBoundingClie.width;
    left = _node$getBoundingClie.left;
  } catch (e) {
    top = defaultBoundingClientRect.top;
    height = defaultBoundingClientRect.height;
    width = defaultBoundingClientRect.width;
    left = defaultBoundingClientRect.left;
  }

  var offsetTop = top - intersectionTop; // element's top relative to intersection
  var offsetLeft = left - intersectionLeft;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return offsetTop - offsets[0] <= intersectionHeight && offsetTop + height + offsets[1] >= 0 && offsetLeft - offsets[0] <= intersectionWidth && offsetLeft + width + offsets[1] >= 0;
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
var checkNormalVisible = function checkNormalVisible(component) {
  var node = _reactDom2.default.findDOMNode(component);

  // If this element is hidden by css rules somehow, it's definitely invisible
  if (!(node.offsetWidth || node.offsetHeight || node.getClientRects().length)) {
    return false;
  }

  var top = void 0;
  var elementHeight = void 0;

  var left = void 0;
  var elementWidth = void 0;

  try {
    var _node$getBoundingClie2 = node.getBoundingClientRect();

    top = _node$getBoundingClie2.top;
    elementHeight = _node$getBoundingClie2.height;
    left = _node$getBoundingClie2.left;
    elementWidth = _node$getBoundingClie2.width;
  } catch (e) {
    top = defaultBoundingClientRect.top;
    elementHeight = defaultBoundingClientRect.height;
    left = defaultBoundingClientRect.left;
    elementWidth = defaultBoundingClientRect.width;
  }

  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  var windowInnerWidth = window.innerWidth || document.documentElement.clientWidth;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return top - offsets[0] <= windowInnerHeight && top + elementHeight + offsets[1] >= 0 && left - offsets[0] <= windowInnerWidth && left + elementWidth + offsets[1] >= 0;
};

/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
var checkVisible = function checkVisible(component, group) {
  var node = _reactDom2.default.findDOMNode(component);
  if (!(node instanceof HTMLElement)) {
    return;
  }

  var parent = (0, _scrollParent2.default)(node);
  var isOverflow = component.props.overflow && parent !== node.ownerDocument && parent !== document && parent !== document.documentElement;
  var visible = isOverflow ? checkOverflowVisible(component, parent) : checkNormalVisible(component);
  if (visible) {
    // Avoid extra render if previously is visible
    if (!component.visible) {
      if (component.props.once) {
        if (pendings[group] === undefined || pendings[group] === null) {
          pendings[group] = [];
        }

        pendings[group].push(component);
      }

      component.visible = true;
      component.forceUpdate();
    }
  } else if (!(component.props.once && component.visible)) {
    component.visible = false;
    if (component.props.unmountIfInvisible) {
      component.forceUpdate();
    }
  }
};

var purgePending = function purgePending(group) {
  if (pendings[group] === undefined || pendings[group] === null) {
    return;
  }

  pendings[group].forEach(function (component) {
    if (listeners[group] === undefined || listeners[group] === null) {
      return;
    }

    var index = listeners[group].indexOf(component);

    if (index !== -1) {
      listeners[group].splice(index, 1);
    }
  });

  pendings[group] = [];
};

var lazyLoadHandler = function lazyLoadHandler(group) {
  if (listeners[group] === undefined || listeners[group] === null) {
    return;
  }

  for (var i = 0; i < listeners[group].length; ++i) {
    var listener = listeners[group][i];
    checkVisible(listener, group);
  }
  // Remove `once` component in listeners
  purgePending(group);
};

// Depending on component's props
var delays = {};
var handlers = {};

var isString = function isString(string) {
  return typeof string === 'string';
};

var detectGroup = function detectGroup(scrollContainer) {
  var group = 'window';
  if (scrollContainer && isString(scrollContainer)) {
    group = scrollContainer;
  }

  return group;
};

var LazyLoad = function (_Component) {
  _inherits(LazyLoad, _Component);

  function LazyLoad(props) {
    _classCallCheck(this, LazyLoad);

    var _this = _possibleConstructorReturn(this, (LazyLoad.__proto__ || Object.getPrototypeOf(LazyLoad)).call(this, props));

    _this.visible = false;
    return _this;
  }

  _createClass(LazyLoad, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // It's unlikely to change delay type on the fly, this is mainly
      // designed for tests
      var scrollport = window;
      var scrollContainer = this.props.scrollContainer;

      var group = detectGroup(scrollContainer);

      if (scrollContainer && isString(scrollContainer)) {
        scrollport = scrollport.document.querySelector(scrollContainer);
      }

      if (!scrollport) {
        console.warn('Scrollport [' + scrollContainer + '] not found.');
        return;
      }

      var isThrottleOverridden = this.props.debounce !== undefined && delays[group] === 'throttle';
      var isDebounceCanceled = delays[group] === 'debounce' && this.props.debounce === undefined;

      // check handler reset is required because of props change
      var needHandlerReset = isThrottleOverridden || isDebounceCanceled;

      // detach event handler for group
      if (needHandlerReset) {
        (0, _event.off)(scrollport, 'scroll', handlers[group], passiveEvent);
        (0, _event.off)(window, 'resize', handlers[group], passiveEvent);
        handlers[group] = null;
      }

      // create event handler for group
      if (handlers[group] === undefined || handlers[group] === null) {
        // create handler with debounce
        if (this.props.debounce !== undefined) {
          handlers[group] = (0, _debounce2.default)(function () {
            lazyLoadHandler(group);
          }, typeof this.props.debounce === 'number' ? this.props.debounce : 300);
          delays[group] = 'debounce';
        } else if (this.props.throttle !== undefined) {
          // create handler with throttle
          handlers[group] = (0, _throttle2.default)(function () {
            lazyLoadHandler(group);
          }, typeof this.props.throttle === 'number' ? this.props.throttle : 300);
          delays[group] = 'throttle';
        } else {
          // create handler without any delays
          handlers[group] = function () {
            lazyLoadHandler(group);
          };
        }
      }

      // init listeners group if is undefined/null
      if (listeners[group] === undefined || listeners[group] === null) {
        listeners[group] = [];
      }

      // attach event to parent element with overflow
      if (this.props.overflow) {
        var parent = (0, _scrollParent2.default)(_reactDom2.default.findDOMNode(this));
        if (parent && typeof parent.getAttribute === 'function') {
          var listenerCount = 1 + +parent.getAttribute(LISTEN_FLAG);
          if (listenerCount === 1) {
            parent.addEventListener('scroll', handlers[group], passiveEvent);
          }
          parent.setAttribute(LISTEN_FLAG, listenerCount);
        }
      } else if (listeners[group].length === 0 || needHandlerReset) {
        // attach event to scrollport / window
        var _props = this.props,
            scroll = _props.scroll,
            resize = _props.resize;


        if (scroll) {
          (0, _event.on)(scrollport, 'scroll', handlers[group], passiveEvent);
        }

        if (resize) {
          (0, _event.on)(window, 'resize', handlers[group], passiveEvent);
        }
      }

      listeners[group].push(this);
      checkVisible(this, group);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return this.visible;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var group = detectGroup(this.props.scrollContainer);

      if (this.props.overflow) {
        var parent = (0, _scrollParent2.default)(_reactDom2.default.findDOMNode(this));
        if (parent && typeof parent.getAttribute === 'function') {
          var listenerCount = +parent.getAttribute(LISTEN_FLAG) - 1;
          if (listenerCount === 0) {
            parent.removeEventListener('scroll', handlers[group], passiveEvent);
            parent.removeAttribute(LISTEN_FLAG);
          } else {
            parent.setAttribute(LISTEN_FLAG, listenerCount);
          }
        }
      }

      if (listeners[group] === undefined || listeners[group] === null) {
        listeners[group] = [];
      }

      var index = listeners[group].indexOf(this);
      if (index !== -1) {
        listeners[group].splice(index, 1);
      }

      if (listeners[group].length === 0 && typeof window !== 'undefined') {
        (0, _event.off)(window, 'resize', handlers[group], passiveEvent);
        (0, _event.off)(window, 'scroll', handlers[group], passiveEvent);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.visible ? this.props.children : this.props.placeholder ? this.props.placeholder : _react2.default.createElement('div', {
        style: { height: this.props.height },
        className: 'lazyload-placeholder'
      });
    }
  }]);

  return LazyLoad;
}(_react.Component);

LazyLoad.propTypes = {
  once: _propTypes2.default.bool,
  height: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  offset: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
  overflow: _propTypes2.default.bool,
  resize: _propTypes2.default.bool,
  scroll: _propTypes2.default.bool,
  children: _propTypes2.default.node,
  throttle: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.bool]),
  debounce: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.bool]),
  placeholder: _propTypes2.default.node,
  scrollContainer: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
  unmountIfInvisible: _propTypes2.default.bool
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true,
  unmountIfInvisible: false
};

var lazyload = exports.lazyload = _decorator2.default;
exports.default = LazyLoad;
exports.forceCheck = lazyLoadHandler;