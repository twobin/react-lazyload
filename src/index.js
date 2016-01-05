/**
 * react-lazyload
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import {on, off} from './utils/event';
import scrollParent from './utils/scrollParent';
import * as rateLimitMethods from './utils/rateLimit';


const SUPPORTED_EVENTS = ['scroll', 'resize', 'wheel', 'mousewheel'];


/**
 * Create a LazyLoad component configured by options
 * @param  {String} options.eventType Events that LazyLoad should listen to, a string of white space separated event types
 * @param  {String} options.rateLimit The rate limit method, can be `debounce` or `throttle`
 * @param  {Number} options.wait      The freqeuency of rate limit checking
 * @return {React}                    The configured lazyload component
 */
export default function createLazyLoad(options = {}) {
  const { eventType = 'scroll', rateLimit = 'debounce', wait = 300 } = options;

  const events = eventType.split(' ');
  if (!events.every(e => SUPPORTED_EVENTS.indexOf(e) > -1)) {
    console.warn('[react-lazyload] Only %s events are recommended!', SUPPORTED_EVENTS.join(', '));
  }

  const listeners = [];
  let pending = [];


  /**
   * Check if `component` is visible in overflow container `parent`
   * @param  {node} component React component
   * @param  {node} parent    component's scroll parent
   * @return {bool}
   */
  const checkOverflowVisible = function(component, parent) {
    const node = ReactDom.findDOMNode(component);

    const scrollTop = parent.scrollTop();
    const { height: elementHeight } = node.getBoundingClientRect();

    let offsets = Array.isArray(component.props.offset) ?
                  component.props.offset :
                  [component.props.offset, component.props.offset]; // Be compatible with previous API
    const elementTop = node.offsetTop;

    return (elementTop < (scrollTop + offsets[0])) &&
           ((elementTop + elementHeight + offsets[1]) > scrollTop);
  }

  /**
   * Check if `component` is visible in document
   * @param  {node} component React component
   * @return {bool}
   */
  const checkNormalVisible = function(component) {
    const node = ReactDom.findDOMNode(component);

    const { top, bottom } = node.getBoundingClientRect();

    const supportPageOffset = window.pageXOffset !== undefined;
    const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

    const scrollTop = supportPageOffset ? window.pageYOffset :
                                          isCSS1Compat ?
                                          document.documentElement.scrollTop :
                                          document.body.scrollTop;

    const elementTop = top + scrollTop;
    const elementHeight = bottom - top;
    const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

    let offsets = Array.isArray(component.props.offset) ?
                  component.props.offset :
                  [component.props.offset, component.props.offset]; // Be compatible with previous API

    return (elementTop < (scrollTop + windowInnerHeight + offsets[0])) &&
           ((elementTop + elementHeight + offsets[1]) > scrollTop);
  }


  /**
   * Detect if element is visible in viewport, if so, set `visible` state to true.
   * If `once` prop is provided true, remove component as listener after checkVisible
   *
   * @param  {React} component   React component that respond to scroll and resize
   */
  const checkVisible = function(component) {
    const node = ReactDom.findDOMNode(component);
    const parent = scrollParent(node);
    const isOverflow = parent !== (node.ownerDocument || document);

    const visible = isOverflow ? checkOverflowVisible(component, parent) : checkNormalVisible(component);

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
    }
    else if (component.state.visible) {
      if (component._firstTimeVisible !== undefined) {
        component._firstTimeVisible = false;
      }

      component.setState({
        visible: false
      });
    }
  };


  const purgePending = function() {
    pending.forEach(component => {
      const index = listeners.indexOf(component);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    });

    pending = [];
  };


  let rateLimitMethod = rateLimitMethods[rateLimit];
  if (typeof rateLimitMethod !== 'function') {
    console.warn('[react-lazyload] %s is not a valid rate limit type, no rate limit method is applied.', rateLimit);
    rateLimitMethod = f => f;
  }
  const lazyLoadHandler = rateLimitMethod(() => {
    for(let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      checkVisible(listener);
    }

    // Remove `once` component in listeners
    purgePending();
  }, wait);


  return class LazyLoad extends Component {
    static propTypes = {
      once: PropTypes.bool,
      offset: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
      children: PropTypes.node,
    };

    static defaultProps = {
      once: false,
      offset: 0,
    };

    constructor(props) {
      super(props);

      this.state = {
        visible: false
      };
    }

    componentDidMount() {
      if (listeners.length === 0) {
        if (events.indexOf('scroll') > -1) {
          on(window, 'scroll', lazyLoadHandler);
        }

        if (events.indexOf('wheel') > -1) {
          if (window.hasOwnProperty('onwheel')) {
            on(window, 'wheel', lazyLoadHandler);
          }
          else {
            on(window, 'mousewheel', lazyLoadHandler);
          }
        }

        if (events.indexOf('resize') > -1) {
          on(window, 'resize', lazyLoadHandler);
        }
      }

      listeners.push(this);
      checkVisible(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return nextState.visible;
    }

    componentWillUpdate(nextProps, nextState) {
      if (this.state.visible && nextState.visible && this._firstTimeVisible) {
        this._firstTimeVisible = false;
      }
    }

    componentWillUnmount() {
      const index = listeners.indexOf(this);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        off(window, 'wheel', lazyLoadHandler);
        off(window, 'mousewheel', lazyLoadHandler);
        off(window, 'resize', lazyLoadHandler);
        off(window, 'scroll', lazyLoadHandler);
      }
    }

    render() {
      return React.cloneElement(this.props.children, {
        visible: this.state.visible,
        firstTimeVisible: this._firstTimeVisible
      });
    }
  }
}
