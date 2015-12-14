/**
 * react-lazyload
 */
import React, {Component, PropTypes} from 'react';
import ReactDom from 'react-dom';
import {on, off} from './utils/event';
import debounce from './utils/debounce';


const listeners = [];
let pending = [];


/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 *
 * @param  {React} component   React component that respond to scroll and resize
 */
const checkVisible = function(component) {
  const node = ReactDom.findDOMNode(component);
  const {top, bottom} = node.getBoundingClientRect();

  const supportPageOffset = window.pageXOffset !== undefined;
  const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

  const scrollTop = supportPageOffset ? window.pageYOffset :
                                        isCSS1Compat ?
                                        document.documentElement.scrollTop :
                                        document.body.scrollTop;

  const elementTop = top + scrollTop;
  const elementHeight = bottom - top;
  const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

  if ((elementTop < (scrollTop + windowInnerHeight + component.props.offset)) &&
      ((elementTop + elementHeight + component.props.offset) > scrollTop)) {

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


const lazyLoadHandler = debounce(() => {
  for(let i = 0; i < listeners.length; ++i) {
    const listener = listeners[i];
    checkVisible(listener);
  }

  // Remove `once` component in listeners
  purgePending();
}, 300);


class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  componentDidMount() {
    if (listeners.length === 0) {
      if (window.hasOwnProperty('onwheel')) {
        on(window, 'wheel', lazyLoadHandler);
      }
      else {
        on(window, 'mousewheel', lazyLoadHandler);
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
    }
  }

  render() {
    return React.cloneElement(this.props.children, {
      visible: this.state.visible,
      firstTimeVisible: this._firstTimeVisible
    });
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  offset: PropTypes.number,
  resize: PropTypes.bool,
  children: PropTypes.node
};

LazyLoad.defaultProps = {
  once: false,
  offset: 0,
  resize: false,
};

export default LazyLoad;
