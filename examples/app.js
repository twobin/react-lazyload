import React, {Component} from 'react';
import LazyLoad from '../src/';
import Widget from './Widget';

class App extends Component {
  constructor() {
    super();

    this.state = {
      arr: [0, 1, 2, 3, 4, 5, 6, 7].map(index => {
        return {
          uniqueId: index,
          once: [6, 7].indexOf(index) > -1
        };
      })
    };
  }

  handleClick() {
    this.setState({
      arr: this.state.arr.map(el => {
        return {
          ...el,
          uniqueId: el.index + 1
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
        </div>
        <div className="widget-list">
          {this.state.arr.map((el, index) => {
            return (
              <LazyLoad once={el.once} key={index}>
                <Widget once={el.once} />
              </LazyLoad>
            );
          })}
        </div>
      </div>
    );
  }
}

React.render(<App />, document.getElementById('container'));
