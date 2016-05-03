/**
 * react-lazyload
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utilsEvent = require('./utils/event');

var _utilsScrollParent = require('./utils/scrollParent');

var _utilsScrollParent2 = _interopRequireDefault(_utilsScrollParent);

var _utilsDebounce = require('./utils/debounce');

var _utilsDebounce2 = _interopRequireDefault(_utilsDebounce);

var _utilsThrottle = require('./utils/throttle');

var _utilsThrottle2 = _interopRequireDefault(_utilsThrottle);

var LISTEN_FLAG = 'data-lazyload-listened';
var listeners = [];
var pending = [];

var warnedAboutPlaceholderHeight = false;
var heightDiffThreshold = 20;

/**
 * Check if `component` is visible in overflow container `parent`
 * @param  {node} component React component
 * @param  {node} parent    component's scroll parent
 * @return {bool}
 */
var checkOverflowVisible = function checkOverflowVisible(component, parent) {
  var node = _reactDom2['default'].findDOMNode(component);

  var scrollTop = parent.scrollTop;
  var parentBottom = scrollTop + parent.offsetHeight;

  var _node$getBoundingClientRect = node.getBoundingClientRect();

  var elementHeight = _node$getBoundingClientRect.height;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  var elementTop = node.offsetTop;
  var elementBottom = elementTop + elementHeight;

  return elementTop - offsets[0] <= parentBottom && elementBottom + offsets[1] >= scrollTop;
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
var checkNormalVisible = function checkNormalVisible(component) {
  var node = _reactDom2['default'].findDOMNode(component);

  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';
  var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  var _node$getBoundingClientRect2 = node.getBoundingClientRect();

  var top = _node$getBoundingClientRect2.top;
  var elementHeight = _node$getBoundingClientRect2.height;

  var elementTop = top + scrollTop; // element top relative to document
  var elementBottom = elementTop + elementHeight;

  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  var documentBottom = scrollTop + windowInnerHeight;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return elementTop - offsets[0] <= documentBottom && elementBottom + offsets[1] >= scrollTop;
};

/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
var checkVisible = function checkVisible(component) {
  var node = _reactDom2['default'].findDOMNode(component);
  if (!node) {
    return;
  }

  var parent = _utilsScrollParent2['default'](node);
  var isOverflow = parent !== (node.ownerDocument || document);

  var visible = isOverflow ? checkOverflowVisible(component, parent) : checkNormalVisible(component);

  if (visible) {
    // Avoid extra render if previously is visible, yeah I mean `render` call,
    // not actual DOM render
    if (!component.visible) {
      if (component.props.once) {
        pending.push(component);
      }

      component.visible = true;
      component.forceUpdate();
    }
  } else if (!(component.props.once && component.visible)) {
    component.visible = false;
  }
};

var purgePending = function purgePending() {
  pending.forEach(function (component) {
    var index = listeners.indexOf(component);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  });

  pending = [];
};

var lazyLoadHandler = function lazyLoadHandler() {
  for (var i = 0; i < listeners.length; ++i) {
    var listener = listeners[i];
    checkVisible(listener);
  }

  // Remove `once` component in listeners
  purgePending();
};

// Depending on component's props
var delayType = undefined;
var finalLazyLoadHandler = null;

var LazyLoad = (function (_Component) {
  _inherits(LazyLoad, _Component);

  function LazyLoad(props) {
    _classCallCheck(this, LazyLoad);

    _Component.call(this, props);

    this.visible = false;

    if (_react2['default'].Children.count(this.props.children) > 1) {
      console.warn('[react-lazyload] Only one child is allowed to be passed to `LazyLoad`.');
    }

    if (typeof this.props.height !== 'number') {
      console.warn('[react-lazyload] Please add `height` props to <LazyLoad> for better performance.');
    }

    if (this.props.wheel) {
      // eslint-disable-line
      console.warn('[react-lazyload] Props `wheel` is not supported anymore, try set `overflow` for lazy loading in overflow containers.');
    }
  }

  LazyLoad.prototype.componentDidMount = function componentDidMount() {
    // It's unlikely to change delay type for an application, this is mainly
    // designed for tests
    var needResetFinalLazyLoadHandler = false;
    if (this.props.debounce !== undefined && delayType === 'throttle') {
      console.warn('[react-lazyload] Previous delay function is `throttle`, now switching to `debounce`, try to set them unanimously');
      needResetFinalLazyLoadHandler = true;
    } else if (delayType === 'debounce' && this.props.debounce === undefined) {
      console.warn('[react-lazyload] Previous delay function is `debounce`, now switching to `throttle`, try to set them unanimously');
      needResetFinalLazyLoadHandler = true;
    }

    if (needResetFinalLazyLoadHandler) {
      _utilsEvent.off(window, 'scroll', finalLazyLoadHandler);
      _utilsEvent.off(window, 'resize', finalLazyLoadHandler);
      finalLazyLoadHandler = null;
    }

    if (!finalLazyLoadHandler) {
      if (this.props.debounce !== undefined) {
        finalLazyLoadHandler = _utilsDebounce2['default'](lazyLoadHandler, typeof this.props.debounce === 'number' ? this.props.debounce : 300);
        delayType = 'debounce';
      } else {
        finalLazyLoadHandler = _utilsThrottle2['default'](lazyLoadHandler, typeof this.props.throttle === 'number' ? this.props.throttle : 300);
        delayType = 'throttle';
      }
    }

    if (this.props.overflow) {
      var _parent = _utilsScrollParent2['default'](_reactDom2['default'].findDOMNode(this));
      if (_parent && _parent.getAttribute(LISTEN_FLAG) === null) {
        _parent.addEventListener('scroll', finalLazyLoadHandler);
        _parent.setAttribute(LISTEN_FLAG, 1);
      }
    } else if (listeners.length === 0 || needResetFinalLazyLoadHandler) {
      var _props = this.props;
      var _scroll = _props.scroll;
      var resize = _props.resize;

      if (_scroll) {
        _utilsEvent.on(window, 'scroll', finalLazyLoadHandler);
      }

      if (resize) {
        _utilsEvent.on(window, 'resize', finalLazyLoadHandler);
      }
    }

    listeners.push(this);
    checkVisible(this);

    if (process.env.NODE_ENV !== 'production') {
      if (this.props.placeholder) {
        var node = _reactDom2['default'].findDOMNode(this);
        if (!warnedAboutPlaceholderHeight && Math.abs(node.offsetHeight - this.props.height) > heightDiffThreshold) {
          console.warn('[react-lazyload] A more specific `height` or `minHeight` for your own placeholder will result better lazyload performance.');
          warnedAboutPlaceholderHeight = true;
        }
      }
    }
  };

  LazyLoad.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
    return this.visible;
  };

  LazyLoad.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.props.overflow) {
      var _parent2 = _utilsScrollParent2['default'](_reactDom2['default'].findDOMNode(this));
      if (_parent2) {
        _parent2.removeEventListener('scroll', finalLazyLoadHandler);
        _parent2.removeAttribute(LISTEN_FLAG);
      }
    }

    var index = listeners.indexOf(this);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      _utilsEvent.off(window, 'resize', finalLazyLoadHandler);
      _utilsEvent.off(window, 'scroll', finalLazyLoadHandler);
    }
  };

  LazyLoad.prototype.render = function render() {
    return this.visible ? this.props.children : this.props.placeholder ? this.props.placeholder : _react2['default'].createElement('div', { style: { height: this.props.height }, className: 'lazyload-placeholder' });
  };

  return LazyLoad;
})(_react.Component);

LazyLoad.propTypes = {
  once: _react.PropTypes.bool,
  height: _react.PropTypes.number.isRequired,
  offset: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.arrayOf(_react.PropTypes.number)]),
  overflow: _react.PropTypes.bool,
  resize: _react.PropTypes.bool,
  scroll: _react.PropTypes.bool,
  children: _react.PropTypes.node,
  throttle: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool]),
  debounce: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool]),
  placeholder: _react.PropTypes.node
};

LazyLoad.defaultProps = {
  once: false,
  height: 100,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true
};

exports['default'] = LazyLoad;

var _decorator = require('./decorator');

var _decorator2 = _interopRequireDefault(_decorator);

exports.lazyload = _decorator2['default'];