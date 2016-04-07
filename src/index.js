/**
 * react-lazyload
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { on, off } from './utils/event';
import scrollParent from './utils/scrollParent';
import debounce from './utils/debounce';


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
  const { height: elementHeight } = node.getBoundingClientRect();

  const offsets = Array.isArray(component.props.offset) ?
                component.props.offset :
                [component.props.offset, component.props.offset]; // Be compatible with previous API
  const elementTop = node.offsetTop;

  return (elementTop < (scrollTop + offsets[0])) &&
         ((elementTop + elementHeight + offsets[1]) > scrollTop);
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

  const offsets = Array.isArray(component.props.offset) ?
                component.props.offset :
                [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (elementTop < (scrollTop + windowInnerHeight + offsets[0])) &&
         ((elementTop + elementHeight + offsets[1]) > scrollTop);
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


const lazyLoadHandler = debounce(() => {
  for (let i = 0; i < listeners.length; ++i) {
    const listener = listeners[i];
    checkVisible(listener);
  }

  // Remove `once` component in listeners
  purgePending();
}, 300);


class LazyLoad extends Component {
  constructor(props) {
    super(props);

    if (props.scroll === true && props.wheel === true) {
      console && console.warn('[react-lazyload] Don\'t use both `scroll` and `wheel` event in LazyLoad component, pick one!');
    }

    this.state = {
      visible: false
    };
  }

  componentDidMount() {
    if (listeners.length === 0) {
      if (this.props.scroll) {
        on(window, 'scroll', lazyLoadHandler);
      }

      if (this.props.wheel) {
        if (window.hasOwnProperty('onwheel')) {
          on(window, 'wheel', lazyLoadHandler);
        } else {
          on(window, 'mousewheel', lazyLoadHandler);
        }
      }

      if (this.props.resize) {
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
      firstTimeVisible: this._firstTimeVisible
    });
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  offset: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  scroll: PropTypes.bool,
  wheel: PropTypes.bool,
  resize: PropTypes.bool,
  children: PropTypes.node
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  scroll: true,
  wheel: false,
  resize: false,
};

export default LazyLoad;

export lazyload from './decorator';
