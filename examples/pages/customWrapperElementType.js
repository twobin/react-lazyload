import React, { Component } from 'react';
import LazyLoad from '../../src/';
import Operation from '../components/Operation';
import { uniqueId } from '../utils';

export default class CustomWrapperElementType extends Component {
  constructor() {
    super();

    this.state = {
      arr: Array(...Array(20)).map((a, index) => ({
        uniqueId: uniqueId(),
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
        <Operation type="normal" onClickUpdate={::this.handleClick} />
        <div className="widget-list">
          <table style={{ border: 'solid 1px black' }}>
            <thead>
              <tr><th>Index</th><th>UniqueId</th></tr>
            </thead>
            <tbody>
              {this.state.arr.map((el, index) => (
                <LazyLoad once={el.once} key={index} height={200} offset={[-100, 0]} wrapperElementType={'tr'} placeholder={<td>Loading...</td>}>
                  <td>{index}</td>
                  <td>{el.uniqueId}</td>
                </LazyLoad>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

