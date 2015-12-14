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

var _utilsDebounce = require('./utils/debounce');

var _utilsDebounce2 = _interopRequireDefault(_utilsDebounce);

var listeners = [];
var pending = [];

/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
var checkVisible = function checkVisible(component) {
  var node = _reactDom2['default'].findDOMNode(component);

  var _node$getBoundingClientRect = node.getBoundingClientRect();

  var top = _node$getBoundingClientRect.top;
  var bottom = _node$getBoundingClientRect.bottom;

  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

  var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  var elementTop = top + scrollTop;
  var elementHeight = bottom - top;
  var windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

  if (elementTop < scrollTop + windowInnerHeight + component.props.offset && elementTop + elementHeight + component.props.offset > scrollTop) {

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

var lazyLoadHandler = _utilsDebounce2['default'](function () {
  for (var i = 0; i < listeners.length; ++i) {
    var listener = listeners[i];
    checkVisible(listener);
  }

  // Remove `once` component in listeners
  purgePending();
}, 300);

var LazyLoad = (function (_Component) {
  _inherits(LazyLoad, _Component);

  function LazyLoad(props) {
    _classCallCheck(this, LazyLoad);

    _Component.call(this, props);

    this.state = {
      visible: false
    };
  }

  LazyLoad.prototype.componentDidMount = function componentDidMount() {
    if (listeners.length === 0) {
      if (window.hasOwnProperty('onwheel')) {
        _utilsEvent.on(window, 'wheel', lazyLoadHandler);
      } else {
        _utilsEvent.on(window, 'mousewheel', lazyLoadHandler);
      }
      if (this.props.resize) {
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

LazyLoad.propTypes = {
  once: _react.PropTypes.bool,
  offset: _react.PropTypes.number,
  resize: _react.PropTypes.bool,
  children: _react.PropTypes.node
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  resize: false
};

exports['default'] = LazyLoad;
module.exports = exports['default'];