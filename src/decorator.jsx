import React, { Component } from 'react';
import LazyLoad from './index';

const getDisplayName = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component';

export default (options = {}) => function lazyload(WrappedComponent) {
  return class LazyLoadDecorated extends Component {
    constructor() {
      super();
      this.displayName = `LazyLoad${getDisplayName(WrappedComponent)}`;
    }

    render() {
      return (
        <LazyLoad {...options}>
          <WrappedComponent {...this.props} />
        </LazyLoad>
      );
    }
  };
};
