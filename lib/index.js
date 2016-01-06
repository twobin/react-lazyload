/**
 * react-lazyload
 */
'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = createLazyLoad;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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

var _utilsRateLimit = require('./utils/rateLimit');

var rateLimitMethods = _interopRequireWildcard(_utilsRateLimit);

var SUPPORTED_EVENTS = ['scroll', 'resize', 'wheel', 'mousewheel'];

/**
 * Create a LazyLoad component configured by options
 * @param  {String} options.eventType Events that LazyLoad should listen to, a string of white space separated event types
 * @param  {String} options.rateLimit The rate limit method, can be `debounce` or `throttle`
 * @param  {Number} options.wait      The freqeuency of rate limit checking
 * @return {React}                    The configured lazyload component
 */

function createLazyLoad() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$eventType = options.eventType;
  var eventType = _options$eventType === undefined ? 'scroll' : _options$eventType;
  var _options$rateLimit = options.rateLimit;
  var rateLimit = _options$rateLimit === undefined ? 'debounce' : _options$rateLimit;
  var _options$wait = options.wait;
  var wait = _options$wait === undefined ? 300 : _options$wait;

  var events = eventType.split(' ');
  if (!events.every(function (e) {
    return SUPPORTED_EVENTS.indexOf(e) > -1;
  })) {
    console.warn('[react-lazyload] Only %s events are recommended!', SUPPORTED_EVENTS.join(', '));
  }

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

    var scrollTop = parent.scrollTop();

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

  var rateLimitMethod = rateLimitMethods[rateLimit];
  if (typeof rateLimitMethod !== 'function') {
    console.warn('[react-lazyload] %s is not a valid rate limit type, no rate limit method is applied.', rateLimit);
    rateLimitMethod = function (f) {
      return f;
    };
  }
  var lazyLoadHandler = rateLimitMethod(function () {
    for (var i = 0; i < listeners.length; ++i) {
      var listener = listeners[i];
      checkVisible(listener);
    }

    // Remove `once` component in listeners
    purgePending();
  }, wait);

  return (function (_Component) {
    _inherits(LazyLoad, _Component);

    _createClass(LazyLoad, null, [{
      key: 'propTypes',
      value: {
        once: _react.PropTypes.bool,
        offset: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.arrayOf(_react.PropTypes.number)]),
        children: _react.PropTypes.node
      },
      enumerable: true
    }, {
      key: 'defaultProps',
      value: {
        once: false,
        offset: 0
      },
      enumerable: true
    }]);

    function LazyLoad(props) {
      _classCallCheck(this, LazyLoad);

      _Component.call(this, props);

      this.state = {
        visible: false
      };
    }

    LazyLoad.prototype.componentDidMount = function componentDidMount() {
      if (listeners.length === 0) {
        if (events.indexOf('scroll') > -1) {
          _utilsEvent.on(window, 'scroll', lazyLoadHandler);
        }

        if (events.indexOf('wheel') > -1) {
          if (window.hasOwnProperty('onwheel')) {
            _utilsEvent.on(window, 'wheel', lazyLoadHandler);
          } else {
            _utilsEvent.on(window, 'mousewheel', lazyLoadHandler);
          }
        }

        if (events.indexOf('resize') > -1) {
          _utilsEvent.on(window, 'resize', lazyLoadHandler);
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
        _utilsEvent.off(window, 'wheel', lazyLoadHandler);
        _utilsEvent.off(window, 'mousewheel', lazyLoadHandler);
        _utilsEvent.off(window, 'resize', lazyLoadHandler);
        _utilsEvent.off(window, 'scroll', lazyLoadHandler);
      }
    };

    LazyLoad.prototype.render = function render() {
      return _react2['default'].cloneElement(this.props.children, {
        visible: this.state.visible,
        firstTimeVisible: this._firstTimeVisible
      });
    };

    return LazyLoad;
  })(_react.Component);
}

module.exports = exports['default'];