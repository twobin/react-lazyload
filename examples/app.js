import React, {Component} from 'react';
import LazyLoad from '../src/';
import Widget from './Widget';

class App extends Component {
  render() {
    return (
      <div className="widget-list">
        <LazyLoad key={1}>
          <Widget />
        </LazyLoad>
        <LazyLoad key={2}>
          <Widget />
        </LazyLoad>
        <LazyLoad key={3}>
          <Widget />
        </LazyLoad>
        <LazyLoad key={4}>
          <Widget />
        </LazyLoad>
        <LazyLoad key={5}>
          <Widget />
        </LazyLoad>
        <LazyLoad key={6} once>
          <Widget text="Only update once!" />
        </LazyLoad>
        <LazyLoad key={7} once>
          <Widget text="Only update once!" />
        </LazyLoad>
        <LazyLoad key={8}>
          <Widget />
        </LazyLoad>
      </div>
    );
  }
}

React.render(<App />, document.getElementById('container'));
