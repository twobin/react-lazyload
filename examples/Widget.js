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
        {this.props.once ? (
          <div className="widget-text once">
            <code>
              &lt;LazyLoad once&gt;<br />
              &lt;Widget /&gt;<br />
              &lt;/LazyLoad&gt;
            </code>
          </div>
        ) : (
          <div className="widget-text">
            <code>
              &lt;LazyLoad&gt;<br />
              &lt;Widget /&gt;<br />
              &lt;/LazyLoad&gt;
            </code>
          </div>
        )}
        <p>render times: {this.state.count}</p>
      </div>
    ) : (
      <div className="widget loading">
        loading...
      </div>
    );
  }
}

export default Widget;
