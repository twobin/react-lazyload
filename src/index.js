/**
 * react-lazyload
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { on, off } from './utils/event';
import scrollParent from './utils/scrollParent';
import debounce from './utils/debounce';
import throttle from './utils/throttle';

const TYPES = ['img', 'iframe'];
const listeners = [];
let pending = [];


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

  return (elementTop >= (scrollTop + offsets[0])) &&
         ((elementBottom + offsets[1]) <= parentBottom);
};

/**
 * Check if `component` is visible in document
 * @param  {node} component React component
 * @return {bool}
 */
const checkNormalVisible = function checkNormalVisible(component) {
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
  const elementBottom = elementTop + elementHeight;
  const documentBottom = scrollTop + windowInnerHeight;

  const offsets = Array.isArray(component.props.offset) ?
                component.props.offset :
                [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (elementTop >= (scrollTop + offsets[0])) &&
         ((elementBottom + offsets[1]) <= documentBottom);
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
let finalLazyLoadHandler = null;


class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  componentDidMount() {
    if (!finalLazyLoadHandler) {
      if (this.props.throttle !== undefined) {
        finalLazyLoadHandler = throttle(lazyLoadHandler, typeof this.props.throttle === 'number' ?
                                                         this.props.throttle :
                                                         300);
      } else {
        finalLazyLoadHandler = debounce(lazyLoadHandler, typeof this.props.debounce === 'number' ?
                                                         this.props.debounce :
                                                         300);
      }
    }

    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && !this.scrollListened) {
        parent.addEventListener('scroll', finalLazyLoadHandler);
      }
    } else {
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
    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent) {
        parent.removeEventListener('scroll', finalLazyLoadHandler);
        this.scrollListened = false;
      }
    }

    const index = listeners.indexOf(this);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      off(window, 'wheel', finalLazyLoadHandler);
      off(window, 'mousewheel', finalLazyLoadHandler);
      off(window, 'resize', finalLazyLoadHandler);
      off(window, 'scroll', finalLazyLoadHandler);
    }
  }

  renderPrimitive(child = {}) {
    let height;
    if (child.props) {
      height = parseFloat(child.props.height);
      if (!height) {
        console.warn(`[react-lazyload] It is recommended to set \`height\` to primitive tags
                      like \`img\`, \`iframe\` for better lazy load experience.`);
      }
    }

    return (
      <div style={{ height: height || 100 }} className="lazyload-placeholder"></div>
    );
  }

  render() {
    if (React.Children.count(this.props.children) > 1) {
      console.warn('[react-lazyload] Only one child is allowed to be passed to `LazyLoad`.');
    }

    const child = this.props.children;
    if (TYPES.indexOf(child.type) > -1 && !this.state.visible) {
      return this.renderPrimitive(child);
    }

    /**
     * For components like images, they shouldn't be rendered until it appears
     * in the viewport.
     */
    if (this.props.once && !this.state.visible) {
      return <span></span>;
    }

    return React.cloneElement(this.props.children, {
      visible: this.state.visible,
      firstTimeVisible: this._firstTimeVisible,
    });
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  offset: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  overflow: PropTypes.bool,
  resize: PropTypes.bool,
  scroll: PropTypes.bool,
  children: PropTypes.node,
  throttle: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  debounce: PropTypes.oneOfType([PropTypes.number, PropTypes.bool])
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true
};

export default LazyLoad;

export lazyload from './decorator';
