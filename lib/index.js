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

  return elementTop >= scrollTop - offsets[0] && elementBottom - offsets[1] <= parentBottom;
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
var checkNormalVisible = function checkNormalVisible(component) {
  var node = _reactDom2['default'].findDOMNode(component);

  var _node$getBoundingClientRect2 = node.getBoundingClientRect();

  var top = _node$getBoundingClientRect2.top;
  var elementHeight = _node$getBoundingClientRect2.height;

  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

  var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  var elementTop = top + scrollTop;
  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  var elementBottom = elementTop + elementHeight;
  var documentBottom = scrollTop + windowInnerHeight;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return elementTop >= scrollTop - offsets[0] && elementBottom - offsets[1] <= documentBottom;
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
  } else {
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
var finalLazyLoadHandler = null;

var LazyLoad = (function (_Component) {
  _inherits(LazyLoad, _Component);

  function LazyLoad(props) {
    _classCallCheck(this, LazyLoad);

    _Component.call(this, props);

    this.visible = false;
  }

  LazyLoad.prototype.componentDidMount = function componentDidMount() {
    if (!finalLazyLoadHandler) {
      if (this.props.debounce !== undefined) {
        finalLazyLoadHandler = _utilsDebounce2['default'](lazyLoadHandler, typeof this.props.throttle === 'number' ? this.props.throttle : 300);
      } else {
        finalLazyLoadHandler = _utilsThrottle2['default'](lazyLoadHandler, typeof this.props.debounce === 'number' ? this.props.debounce : 300);
      }
    }

    if (this.props.overflow) {
      var _parent = _utilsScrollParent2['default'](_reactDom2['default'].findDOMNode(this));
      if (_parent && _parent.getAttribute(LISTEN_FLAG) === null) {
        _parent.addEventListener('scroll', finalLazyLoadHandler);
        _parent.setAttribute(LISTEN_FLAG, 1);
      }
    } else if (listeners.length === 0) {
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
      _utilsEvent.off(window, 'wheel', finalLazyLoadHandler);
      _utilsEvent.off(window, 'mousewheel', finalLazyLoadHandler);
      _utilsEvent.off(window, 'resize', finalLazyLoadHandler);
      _utilsEvent.off(window, 'scroll', finalLazyLoadHandler);
    }
  };

  LazyLoad.prototype.render = function render() {
    if (_react2['default'].Children.count(this.props.children) > 1) {
      console.warn('[react-lazyload] Only one child is allowed to be passed to `LazyLoad`.');
    }

    return this.visible ? this.props.children : _react2['default'].createElement('div', { style: { height: this.props.height }, className: 'lazyload-placeholder' });
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
  debounce: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool])
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