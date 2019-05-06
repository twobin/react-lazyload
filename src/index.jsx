/**
 * react-lazyload
 */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { on, off } from './utils/event';
import scrollParent from './utils/scrollParent';
import debounce from './utils/debounce';
import throttle from './utils/throttle';
import decorator from './decorator';

const defaultBoundingClientRect = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0
};
const LISTEN_FLAG = 'data-lazyload-listened';

const listeners = {};
const pendings = {};

// try to handle passive events
let passiveEventSupported = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      passiveEventSupported = true;
    }
  });
  window.addEventListener('test', null, opts);
} catch (e) {
  // do nothing here
}
// if they are supported, setup the optional params
// IMPORTANT: FALSE doubles as the default CAPTURE value!
const passiveEvent = passiveEventSupported
  ? { capture: false, passive: true }
  : false;

/**
 * Check if `component` is visible in overflow container `parent`
 * @param  {node} component React component
 * @param  {node} parent    component's scroll parent
 * @return {bool}
 */
const checkOverflowVisible = function checkOverflowVisible(component, parent) {
  const node = ReactDom.findDOMNode(component);

  let parentTop;
  let parentHeight;

  let parentWidth;
  let parentLeft;

  try {
    ({
      top: parentTop,
      height: parentHeight,
      width: parentWidth,
      left: parentLeft
    } = parent.getBoundingClientRect());
  } catch (e) {
    ({
      top: parentTop,
      height: parentHeight,
      width: parentWidth,
      left: parentLeft
    } = defaultBoundingClientRect);
  }

  const windowInnerHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowInnerWidth =
    window.innerWidth || document.documentElement.clientWidth;

  // calculate top and height of the intersection of the element's scrollParent and viewport
  const intersectionTop = Math.max(parentTop, 0); // intersection's top relative to viewport
  const intersectionHeight =
    Math.min(windowInnerHeight, parentTop + parentHeight) - intersectionTop; // height

  const intersectionLeft = Math.max(parentLeft, 0);
  const intersectionWidth =
    Math.min(windowInnerWidth, parentLeft + parentWidth) - intersectionLeft;

  // check whether the element is visible in the intersection
  let top;
  let height;

  let width;
  let left;

  try {
    ({ top, height, width, left } = node.getBoundingClientRect());
  } catch (e) {
    ({ top, height, width, left } = defaultBoundingClientRect);
  }

  const offsetTop = top - intersectionTop; // element's top relative to intersection
  const offsetLeft = left - intersectionLeft;

  const offsets = Array.isArray(component.props.offset)
    ? component.props.offset
    : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (
    offsetTop - offsets[0] <= intersectionHeight &&
    offsetTop + height + offsets[1] >= 0 &&
    offsetLeft - offsets[0] <= intersectionWidth &&
    offsetLeft + width + offsets[1] >= 0
  );
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
const checkNormalVisible = function checkNormalVisible(component) {
  const node = ReactDom.findDOMNode(component);

  // If this element is hidden by css rules somehow, it's definitely invisible
  if (
    !(node.offsetWidth || node.offsetHeight || node.getClientRects().length)
  ) {
    return false;
  }

  let top;
  let elementHeight;

  let left;
  let elementWidth;

  try {
    ({
      top,
      height: elementHeight,
      left,
      width: elementWidth
    } = node.getBoundingClientRect());
  } catch (e) {
    ({
      top,
      height: elementHeight,
      left,
      width: elementWidth
    } = defaultBoundingClientRect);
  }

  const windowInnerHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowInnerWidth =
    window.innerWidth || document.documentElement.clientWidth;

  const offsets = Array.isArray(component.props.offset)
    ? component.props.offset
    : [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (
    top - offsets[0] <= windowInnerHeight &&
    top + elementHeight + offsets[1] >= 0 &&
    left - offsets[0] <= windowInnerWidth &&
    left + elementWidth + offsets[1] >= 0
  );
};

/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
const checkVisible = function checkVisible(component, group) {
  const node = ReactDom.findDOMNode(component);
  if (!(node instanceof HTMLElement)) {
    return;
  }

  const parent = scrollParent(node);
  const isOverflow =
    component.props.overflow &&
    parent !== node.ownerDocument &&
    parent !== document &&
    parent !== document.documentElement;
  const visible = isOverflow
    ? checkOverflowVisible(component, parent)
    : checkNormalVisible(component);
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

const purgePending = function purgePending(group) {
  if (pendings[group] === undefined || pendings[group] === null) {
    return;
  }

  pendings[group].forEach((component) => {
    if (listeners[group] === undefined || listeners[group] === null) {
      return;
    }

    const index = listeners[group].indexOf(component);

    if (index !== -1) {
      listeners[group].splice(index, 1);
    }
  });

  pendings[group] = [];
};

const lazyLoadHandler = (group) => {
  if (listeners[group] === undefined || listeners[group] === null) {
    return;
  }

  for (let i = 0; i < listeners[group].length; ++i) {
    const listener = listeners[group][i];
    checkVisible(listener, group);
  }
  // Remove `once` component in listeners
  purgePending(group);
};

// Depending on component's props
const delays = {};
const handlers = {};

const isString = string => typeof string === 'string';

const detectGroup = function detectGroup(scrollContainer) {
  let group = 'window';
  if (scrollContainer && isString(scrollContainer)) {
    group = scrollContainer;
  }

  return group;
};

class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.visible = false;
  }

  componentDidMount() {
    // It's unlikely to change delay type on the fly, this is mainly
    // designed for tests
    let scrollport = window;
    const { scrollContainer } = this.props;
    const group = detectGroup(scrollContainer);

    if (scrollContainer && isString(scrollContainer)) {
      scrollport = scrollport.document.querySelector(scrollContainer);
    }

    if (!scrollport) {
      console.warn(`Scrollport [${scrollContainer}] not found.`);
      return;
    }

    const isThrottleOverridden = (this.props.debounce !== undefined && delays[group] === 'throttle');
    const isDebounceCanceled = (delays[group] === 'debounce' && this.props.debounce === undefined);

    // check handler reset is required because of props change
    const needHandlerReset = isThrottleOverridden || isDebounceCanceled;

    // detach event handler for group
    if (needHandlerReset) {
      off(scrollport, 'scroll', handlers[group], passiveEvent);
      off(window, 'resize', handlers[group], passiveEvent);
      handlers[group] = null;
    }

    // create event handler for group
    if (handlers[group] === undefined || handlers[group] === null) {
      // create handler with debounce
      if (this.props.debounce !== undefined) {
        handlers[group] = debounce(
          () => {
            lazyLoadHandler(group);
          },
          typeof this.props.debounce === 'number' ? this.props.debounce : 300
        );
        delays[group] = 'debounce';
      } else if (this.props.throttle !== undefined) {
        // create handler with throttle
        handlers[group] = throttle(
          () => {
            lazyLoadHandler(group);
          },
          typeof this.props.throttle === 'number' ? this.props.throttle : 300
        );
        delays[group] = 'throttle';
      } else {
        // create handler without any delays
        handlers[group] = () => {
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
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && typeof parent.getAttribute === 'function') {
        const listenerCount = 1 + +parent.getAttribute(LISTEN_FLAG);
        if (listenerCount === 1) {
          parent.addEventListener('scroll', handlers[group], passiveEvent);
        }
        parent.setAttribute(LISTEN_FLAG, listenerCount);
      }
    } else if (listeners[group].length === 0 || needHandlerReset) {
      // attach event to scrollport / window
      const { scroll, resize } = this.props;

      if (scroll) {
        on(scrollport, 'scroll', handlers[group], passiveEvent);
      }

      if (resize) {
        on(window, 'resize', handlers[group], passiveEvent);
      }
    }

    listeners[group].push(this);
    checkVisible(this, group);
  }

  shouldComponentUpdate() {
    return this.visible;
  }

  componentWillUnmount() {
    const group = detectGroup(this.props.scrollContainer);

    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && typeof parent.getAttribute === 'function') {
        const listenerCount = +parent.getAttribute(LISTEN_FLAG) - 1;
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

    const index = listeners[group].indexOf(this);
    if (index !== -1) {
      listeners[group].splice(index, 1);
    }

    if (listeners[group].length === 0 && typeof window !== 'undefined') {
      off(window, 'resize', handlers[group], passiveEvent);
      off(window, 'scroll', handlers[group], passiveEvent);
    }
  }

  render() {
    return this.visible ? (
      this.props.children
    ) : this.props.placeholder ? (
      this.props.placeholder
    ) : (
      <div
        style={{ height: this.props.height }}
        className="lazyload-placeholder"
      />
    );
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  offset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  overflow: PropTypes.bool,
  resize: PropTypes.bool,
  scroll: PropTypes.bool,
  children: PropTypes.node,
  throttle: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  debounce: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  placeholder: PropTypes.node,
  scrollContainer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  unmountIfInvisible: PropTypes.bool
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true,
  unmountIfInvisible: false
};

export const lazyload = decorator;
export default LazyLoad;
export { lazyLoadHandler as forceCheck };
