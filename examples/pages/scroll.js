import React, { Component } from 'react';
import LazyLoad from '../../src/';
import Widget from '../components/Widget';
import Operation from '../components/Operation';
import { uniqueId } from '../utils';

export default class Scroll extends Component {
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
      arr: this.state.arr.map(el => ({ ...el, uniqueId: id }))
    });
  }

  handleQuickJump(index, e) {
    if (e) {
      e.preventDefault();
    }

    const nodeList = document.querySelectorAll('.widget-list .widget-wrapper');
    if (nodeList[index]) {
      window.scrollTo(0, nodeList[index].getBoundingClientRect().top + window.pageYOffset);
    }
  }

  render() {
    return (
      <div className="wrapper">
        <Operation type="scroll" onClickUpdate={::this.handleClick} />
        <div className="quick-jump">
          <h4>Quick jump to: </h4>
          {this.state.arr.map((el, index) => (
            <a onClick={this.handleQuickJump.bind(this, index)} key={index}>{index + 1}</a>
          ))}
        </div>
        <div className="widget-list">
          {this.state.arr.map((el, index) => (
            <div className="widget-wrapper" key={index}>
              <LazyLoad once={el.once} height={200}>
                <Widget once={el.once} id={el.uniqueId} count={ index + 1 } />
              </LazyLoad>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

