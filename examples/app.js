import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, Link} from 'react-router';

import Decorator from './pages/decorator';
import Normal from './pages/Normal';
import Scroll from './pages/Scroll';
import Overflow from './pages/Overflow';

const Home = () => (
  <ul>
    <li><Link to="/normal">normal</Link></li>
    <li><Link to="/decorator">using with <code>decorator</code></Link></li>
    <li><Link to="/scroll">using with <code>scrollTo</code></Link></li>
    <li><Link to="/overflow">using inside overflow container</Link></li>
  </ul>
);

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={Home} />
    <Route path="/decorator" component={Decorator} />
    <Route path="/normal" component={Normal} />
    <Route path="/scroll" component={Scroll} />
    <Route path="/overflow" component={Overflow} />
  </Router>
);

ReactDOM.render(routes, document.getElementById('app'));
