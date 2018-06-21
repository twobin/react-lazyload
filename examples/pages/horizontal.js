import React, { Component } from 'react';
import LazyLoad from '../../src/';
import Widget from '../components/Widget';
import Operation from '../components/Operation';
import { uniqueId } from '../utils';

export default class Horizontal extends Component {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: Array(...Array(20)).map((a, index) => ({
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
        <Operation type="horizontal" onClickUpdate={this.handleClick} />
        <div className="widget-list-horizontal">
          {this.state.arr.map((el, index) => (
            <LazyLoad
              once={el.once}
              key={index}
              debounce={500}
              height={200}
              mode="horizontal"
              overflow
            >
              <Widget once={el.once} id={el.uniqueId} count={index + 1} />
            </LazyLoad>
            ))}
        </div>
      </div>
    );
  }
}
