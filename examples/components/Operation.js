import React from 'react';
import {Link} from 'react-router';

export default ({ type, onClickUpdate, noExtra }) => (
  <div className="op">
    <div className="top-link">
      <a href={`https://github.com/jasonslyvia/react-lazyload/tree/master/examples/pages/${type}.js`}
        target="_blank" title="Checkout source file in Github"
      >
        source
      </a>
      <Link to="/" title="Go back to menu">back</Link>
    </div>
    {!noExtra && (
      <div>
        <a className="update-btn button-secondary pure-button" onClick={onClickUpdate}>Update</a>
        <p className="desc">
          Clicking this button will make all <code>Widgets</code> in <strong> visible area </strong>
          reload data from server.
        </p>
        <p className="desc">
          Pay attention to <code>props from parent</code> block in <code>Widget</code>
          to identify how LazyLoad works.
        </p>
      </div>
    )}
  </div>
);
