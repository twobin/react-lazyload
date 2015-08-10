/**
 * react-lazyload
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _utilsEvent = require('./utils/event');

var _utilsDebounce = require('./utils/debounce');

var _utilsDebounce2 = _interopRequireDefault(_utilsDebounce);

var listeners = [];

var checkVisible = function checkVisible(component) {
  var node = _reactAddons2['default'].findDOMNode(component);

  var _node$getBoundingClientRect = node.getBoundingClientRect();

  var top = _node$getBoundingClientRect.top;
  var bottom = _node$getBoundingClientRect.bottom;

  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

  var scrollTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  var elementTop = top + scrollTop;
  var elementHeight = bottom - top;

  if (elementTop < scrollTop + window.innerHeight && elementTop + elementHeight > scrollTop) {
    component.setState({
      visible: true
    });

    if (component.props.once) {
      listeners.splice(listeners.indexOf(component), 1);
    }
  }
};

var lazyLoadHandler = _utilsDebounce2['default'](function () {
  listeners.forEach(function (listener) {
    checkVisible(listener);
  });
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
      _utilsEvent.on(window, 'scroll', lazyLoadHandler);
      _utilsEvent.on(window, 'resize', lazyLoadHandler);
    }

    listeners.push(this);
    checkVisible(this);
  };

  LazyLoad.prototype.componentWillUnmount = function componentWillUnmount() {
    var index = listeners.indexOf(this);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      _utilsEvent.off(window, 'scroll', lazyLoadHandler);
      _utilsEvent.off(window, 'resize', lazyLoadHandler);
    }
  };

  LazyLoad.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    return nextState.visible || this.state.visible;
  };

  LazyLoad.prototype.render = function render() {
    return _reactAddons.addons.cloneWithProps(this.props.children, { visible: this.state.visible });
  };

  return LazyLoad;
})(_reactAddons.Component);

LazyLoad.propTypes = {
  once: _reactAddons.PropTypes.bool,
  children: _reactAddons.PropTypes.node
};

LazyLoad.defaultProps = {
  once: false
};

exports['default'] = LazyLoad;
module.exports = exports['default'];