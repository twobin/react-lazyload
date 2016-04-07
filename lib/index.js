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

var TYPES = ['img', 'iframe'];
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

  var _node$getBoundingClientRect = node.getBoundingClientRect();

  var elementHeight = _node$getBoundingClientRect.height;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API
  var elementTop = node.offsetTop;

  return elementTop < scrollTop + offsets[0] && elementTop + elementHeight + offsets[1] > scrollTop;
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
  var bottom = _node$getBoundingClientRect2.bottom;

  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

  var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  var elementTop = top + scrollTop;
  var elementHeight = bottom - top;
  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

  var offsets = Array.isArray(component.props.offset) ? component.props.offset : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return elementTop < scrollTop + windowInnerHeight + offsets[0] && elementTop + elementHeight + offsets[1] > scrollTop;
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
    if (!component.state.visible) {
      component._firstTimeVisible = component._firstTimeVisible === undefined;
      component.setState({
        visible: true
      });
    }

    if (component.props.once) {
      pending.push(component);
    }
  } else if (component.state.visible) {
    if (component._firstTimeVisible !== undefined) {
      component._firstTimeVisible = false;
    }

    component.setState({
      visible: false
    });
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

    if (props.scroll === true && props.wheel === true) {
      console && console.warn('[react-lazyload] Don\'t use both `scroll` and `wheel` event in LazyLoad component, pick one!');
    }

    this.state = {
      visible: false
    };
  }

  LazyLoad.prototype.componentDidMount = function componentDidMount() {
    if (listeners.length === 0) {
      var _props = this.props;
      var _scroll = _props.scroll;
      var wheel = _props.wheel;
      var resize = _props.resize;

      if (this.props.throttle !== undefined) {
        finalLazyLoadHandler = _utilsThrottle2['default'](lazyLoadHandler, typeof this.props.throttle === 'number' ? this.props.throttle : 300);
      } else {
        finalLazyLoadHandler = _utilsDebounce2['default'](lazyLoadHandler, typeof this.props.debounce === 'number' ? this.props.debounce : 300);
      }

      if (_scroll) {
        _utilsEvent.on(window, 'scroll', finalLazyLoadHandler);
      }

      if (wheel) {
        if (window.hasOwnProperty('onwheel')) {
          _utilsEvent.on(window, 'wheel', finalLazyLoadHandler);
        } else {
          _utilsEvent.on(window, 'mousewheel', finalLazyLoadHandler);
        }
      }

      if (resize) {
        _utilsEvent.on(window, 'resize', finalLazyLoadHandler);
      }
    }

    listeners.push(this);
    checkVisible(this);
  };

  LazyLoad.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    return nextState.visible;
  };

  LazyLoad.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
    if (this.state.visible && nextState.visible && this._firstTimeVisible) {
      this._firstTimeVisible = false;
    }
  };

  LazyLoad.prototype.componentWillUnmount = function componentWillUnmount() {
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

  LazyLoad.prototype.renderPrimitive = function renderPrimitive() {
    var child = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var height = undefined;
    if (child.props) {
      height = parseFloat(child.props.height);
      if (!height) {
        console.warn('[react-lazyload] It is recommended to set `height` to primitive tags\n                      like `img`, `iframe` for better lazy load experience.');
      }
    }

    return _react2['default'].createElement('div', { style: { height: height || 100 }, className: 'lazyload-placeholder' });
  };

  LazyLoad.prototype.render = function render() {
    if (_react2['default'].Children.count(this.props.children) > 1) {
      console.warn('[react-lazyload] Only one child is allowed to be passed to `LazyLoad`.');
    }

    var child = this.props.children;
    if (TYPES.indexOf(child.type) > -1 && !this.state.visible) {
      return this.renderPrimitive(child);
    }

    /**
     * For components like images, they shouldn't be rendered until it appears
     * in the viewport.
     */
    if (this.props.once && !this.state.visible) {
      return _react2['default'].createElement('span', null);
    }

    return _react2['default'].cloneElement(this.props.children, {
      visible: this.state.visible,
      firstTimeVisible: this._firstTimeVisible
    });
  };

  return LazyLoad;
})(_react.Component);

LazyLoad.propTypes = {
  once: _react.PropTypes.bool,
  offset: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.arrayOf(_react.PropTypes.number)]),
  scroll: _react.PropTypes.bool,
  wheel: _react.PropTypes.bool,
  resize: _react.PropTypes.bool,
  children: _react.PropTypes.node,
  throttle: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool]),
  debounce: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool])
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  scroll: true,
  wheel: false,
  resize: false
};

exports['default'] = LazyLoad;

var _decorator = require('./decorator');

var _decorator2 = _interopRequireDefault(_decorator);

exports.lazyload = _decorator2['default'];