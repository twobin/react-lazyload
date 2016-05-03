/**
 * react-lazyload
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { on, off } from './utils/event';
import scrollParent from './utils/scrollParent';
import debounce from './utils/debounce';
import throttle from './utils/throttle';

const LISTEN_FLAG = 'data-lazyload-listened';
const listeners = [];
let pending = [];

let warnedAboutPlaceholderHeight = false;
const heightDiffThreshold = 20;


/**
 * Check if `component` is visible in overflow container `parent`
 * @param  {node} component React component
 * @param  {node} parent    component's scroll parent
 * @return {bool}
 */
const checkOverflowVisible = function checkOverflowVisible(component, parent) {
  const node = ReactDom.findDOMNode(component);

  const scrollTop = parent.scrollTop;
  const parentBottom = scrollTop + parent.offsetHeight;
  const { height: elementHeight } = node.getBoundingClientRect();

  const offsets = Array.isArray(component.props.offset) ?
                component.props.offset :
                [component.props.offset, component.props.offset]; // Be compatible with previous API

  const elementTop = node.offsetTop;
  const elementBottom = elementTop + elementHeight;

  return (elementTop - offsets[0] <= parentBottom) &&
         (elementBottom + offsets[1] >= scrollTop);
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
const checkNormalVisible = function checkNormalVisible(component) {
  const node = ReactDom.findDOMNode(component);

  const supportPageOffset = window.pageXOffset !== undefined;
  const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
  const scrollTop = supportPageOffset ? window.pageYOffset :
                                        isCSS1Compat ?
                                        document.documentElement.scrollTop :
                                        document.body.scrollTop;

  const { top, height: elementHeight } = node.getBoundingClientRect();
  const elementTop = top + scrollTop; // element top relative to document
  const elementBottom = elementTop + elementHeight;

  const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  const documentBottom = scrollTop + windowInnerHeight;

  const offsets = Array.isArray(component.props.offset) ?
                component.props.offset :
                [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (elementTop - offsets[0] <= documentBottom) &&
         (elementBottom + offsets[1] >= scrollTop);
};


/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
const checkVisible = function checkVisible(component) {
  const node = ReactDom.findDOMNode(component);
  if (!node) {
    return;
  }

  const parent = scrollParent(node);
  const isOverflow = parent !== (node.ownerDocument || document);

  const visible = isOverflow ?
                  checkOverflowVisible(component, parent) :
                  checkNormalVisible(component);

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


const purgePending = function purgePending() {
  pending.forEach(component => {
    const index = listeners.indexOf(component);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  });

  pending = [];
};


const lazyLoadHandler = () => {
  for (let i = 0; i < listeners.length; ++i) {
    const listener = listeners[i];
    checkVisible(listener);
  }

  // Remove `once` component in listeners
  purgePending();
};

// Depending on component's props
let delayType;
let finalLazyLoadHandler = null;


class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.visible = false;

    if (React.Children.count(this.props.children) > 1) {
      console.warn('[react-lazyload] Only one child is allowed to be passed to `LazyLoad`.');
    }

    if (typeof this.props.height !== 'number') {
      console.warn('[react-lazyload] Please add `height` props to <LazyLoad> for better performance.');
    }

    if (this.props.wheel) { // eslint-disable-line
      console.warn('[react-lazyload] Props `wheel` is not supported anymore, try set `overflow` for lazy loading in overflow containers.');
    }
  }

  componentDidMount() {
    // It's unlikely to change delay type for an application, this is mainly
    // designed for tests
    let needResetFinalLazyLoadHandler = false;
    if (this.props.debounce !== undefined && delayType === 'throttle') {
      console.warn('[react-lazyload] Previous delay function is `throttle`, now switching to `debounce`, try to set them unanimously');
      needResetFinalLazyLoadHandler = true;
    } else if (delayType === 'debounce' && this.props.debounce === undefined) {
      console.warn('[react-lazyload] Previous delay function is `debounce`, now switching to `throttle`, try to set them unanimously');
      needResetFinalLazyLoadHandler = true;
    }

    if (needResetFinalLazyLoadHandler) {
      off(window, 'scroll', finalLazyLoadHandler);
      off(window, 'resize', finalLazyLoadHandler);
      finalLazyLoadHandler = null;
    }

    if (!finalLazyLoadHandler) {
      if (this.props.debounce !== undefined) {
        finalLazyLoadHandler = debounce(lazyLoadHandler, typeof this.props.debounce === 'number' ?
                                                         this.props.debounce :
                                                         300);
        delayType = 'debounce';
      } else {
        finalLazyLoadHandler = throttle(lazyLoadHandler, typeof this.props.throttle === 'number' ?
                                                         this.props.throttle :
                                                         300);
        delayType = 'throttle';
      }
    }

    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && parent.getAttribute(LISTEN_FLAG) === null) {
        parent.addEventListener('scroll', finalLazyLoadHandler);
        parent.setAttribute(LISTEN_FLAG, 1);
      }
    } else if (listeners.length === 0 || needResetFinalLazyLoadHandler) {
      const { scroll, resize } = this.props;

      if (scroll) {
        on(window, 'scroll', finalLazyLoadHandler);
      }

      if (resize) {
        on(window, 'resize', finalLazyLoadHandler);
      }
    }

    listeners.push(this);
    checkVisible(this);

    if (process.env.NODE_ENV !== 'production') {
      if (this.props.placeholder) {
        const node = ReactDom.findDOMNode(this);
        if (!warnedAboutPlaceholderHeight &&
            Math.abs(node.offsetHeight - this.props.height) > heightDiffThreshold) {
          console.warn(`[react-lazyload] A more specific \`height\` or \`minHeight\` for your own placeholder will result better lazyload performance.`);
          warnedAboutPlaceholderHeight = true;
        }
      }
    }
  }

  shouldComponentUpdate() {
    return this.visible;
  }

  componentWillUnmount() {
    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent) {
        parent.removeEventListener('scroll', finalLazyLoadHandler);
        parent.removeAttribute(LISTEN_FLAG);
      }
    }

    const index = listeners.indexOf(this);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      off(window, 'resize', finalLazyLoadHandler);
      off(window, 'scroll', finalLazyLoadHandler);
    }
  }

  render() {
    return this.visible ?
           this.props.children :
             this.props.placeholder ?
                this.props.placeholder :
                <div style={{ height: this.props.height }} className="lazyload-placeholder"></div>;
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  height: PropTypes.number.isRequired,
  offset: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  overflow: PropTypes.bool,
  resize: PropTypes.bool,
  scroll: PropTypes.bool,
  children: PropTypes.node,
  throttle: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  debounce: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  placeholder: PropTypes.node
};

LazyLoad.defaultProps = {
  once: false,
  height: 100,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true
};

export default LazyLoad;

export lazyload from './decorator';
