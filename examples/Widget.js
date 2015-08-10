import React, {Component} from 'react';

class Widget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isReady: false,
      count: 0
    };
  }

  componentWillReceiveProps() {
    if(this.state.isReady) {
      this.setState({
        isReady: false
      });
    }

    setTimeout(() => {
      this.setState({
        isReady: true,
        count: this.state.count + 1
      });
    }, 500);
  }

  render() {
    return this.state.isReady ? (
      <div className="widget">
        render times: {this.state.count}
      </div>
    ) : (
      <div className="widget loading">
        loading...
      </div>
    );
  }
}

export default Widget;
