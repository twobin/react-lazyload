import React from 'react';

export default class Test extends React.Component {
  constructor() {
    super();
    this.state = {
      times: 1
    };
  }

  componentWillReceiveProps() {
    this.setState({
      times: this.state.times + 1
    });
  }

  render() {
    return (
      <div style={{ height: this.props.height + 'px' }} className={"test test" + this.props.id + " " + this.props.className}>
        <span className="times">{this.state.times}</span>
        {this.props.children}
      </div>
    );
  }
}
