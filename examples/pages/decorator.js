import React, { Component } from 'react';
import { lazyload } from '../../src/';
import Widget from '../components/Widget';
import Operation from '../components/Operation';
import { uniqueId } from '../utils';

@lazyload({
  height: 200,
  throttle: 100
})
class MyWidget extends Component {
  render() {
    return <Widget {...this.props} />;
  }
}

export default class Decorator extends Component {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: Array.apply(null, Array(20)).map((a, index) => ({
        uniqueId: id,
        once: [6, 7].indexOf(index) > -1
      }))
    };
  }

  handleClick() {
    const id = uniqueId();

    this.setState({
      arr: this.state.arr.map(el => ({
        ...el,
        uniqueId: id
      }))
    });
  }

  render() {
    return (
      <div className="wrapper">
        <Operation type="decorator" onClickUpdate={::this.handleClick} />
        <div className="widget-list">
          {this.state.arr.map((el, index) => {
            return (
              <MyWidget key={index} once={el.once} id={el.uniqueId} count={index + 1} />
            );
          })}
        </div>
      </div>
    );
  }
}
