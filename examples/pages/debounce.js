import React, { Component } from 'react';
import LazyLoad from '../../src/';
import Widget from '../components/Widget';
import Operation from '../components/Operation';
import { uniqueId } from '../utils';

export default class Debounce extends Component {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: Array.apply(null, Array(20)).map((a, index) => {
        return {
          uniqueId: id,
          once: [6, 7].indexOf(index) > -1
        };
      })
    };
  }

  handleClick() {
    const id = uniqueId();

    this.setState({
      arr: this.state.arr.map(el => {
        return {
          ...el,
          uniqueId: id
        };
      })
    });
  }

  render() {
    return (
      <div className="wrapper">
        <Operation type="debounce" onClickUpdate={::this.handleClick} />
        <div className="widget-list">
          {this.state.arr.map((el, index) => {
            return (
              <LazyLoad once={el.once} key={index} debounce={500} height={200}>
                <Widget once={el.once} id={el.uniqueId} count={ index + 1 } />
              </LazyLoad>
            );
          })}
        </div>
      </div>
    );
  }
}

