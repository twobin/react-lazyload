import React, {Component} from 'react';
import ReactDom from 'react-dom';
import LazyLoad from '../src/';
import Widget from './Widget';

function uniqueId() {
 return (Math.random().toString(36) + '00000000000000000').slice(2, 10);
}

class App extends Component {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: [0, 1, 2, 3, 4, 5, 6, 7].map(index => {
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
        <div className="op">
          <a className="update-btn button-secondary pure-button" onClick={::this.handleClick}>Update</a>
          <p className="desc">Clicking this button will make all <code>Widgets</code> in <strong> visible area </strong>reload data from server.</p>
          <p className="desc">Pay attention to <code>props from parent</code> block in <code>Widget</code> to identify how LazyLoad works.</p>
        </div>
        <div className="widget-list">
          {this.state.arr.map((el, index) => {
            return (
              <LazyLoad once={el.once} key={index}>
                <Widget once={el.once} id={el.uniqueId} />
              </LazyLoad>
            );
          })}
        </div>
        <h1>LazyLoad in Overflow Container</h1>
        <div className="widget-list overflow">
          {this.state.arr.map((el, index) => {
            return (
              <LazyLoad once={el.once} key={index} wheel={true}>
                <Widget once={el.once} id={el.uniqueId} />
              </LazyLoad>
            );
          })}
        </div>
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('container'));
