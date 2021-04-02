import React, { Component } from 'react';
import Lazyload from '../../src/';
import Operation from '../components/Operation';

export default class DynamicHeight extends Component {
  render() {
    const sizes = [...Array(20).keys()].map(i => (i+1) * 20);
    return (
      <div className="wrapper">
        <Operation type="image" noExtra />
        <div className="widget-list">
          {sizes.map(size => 
            <Lazyload height={100} unmountIfInvisible={true}>
              <div style={{ height: size, margin: 10, backgroundColor: 'grey' }}>
                Dynamic element with height {size}
              </div>
            </Lazyload>
          )}
        </div>
      </div>
    );
  }
}

