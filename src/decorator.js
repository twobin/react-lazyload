import LazyLoad from './index';
import React, { Component } from 'react';

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export default (options = {}) => {
  return function lazyload(WrappedComponent) {
    return class LazyLoadDecorated extends Component {
      static displayName = `LazyLoad${getDisplayName(WrappedComponent)}`;

      render() {
        return (
          <LazyLoad {...options}>
            <WrappedComponent {...this.props} />
          </LazyLoad>
        );
      }
    };
  };
};
