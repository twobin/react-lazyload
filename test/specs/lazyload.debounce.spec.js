/* eslint no-unused-expressions: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import LazyLoad from '../../src/index';
import spies from 'chai-spies';
import Test from '../Test.component';

chai.use(spies);
const expect = chai.expect;


before(() => {
  document.body.style.margin = 0;
  document.body.style.padding = 0;
});

let div;

beforeEach(() => {
  div = document.createElement('div');
  document.body.appendChild(div);
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(div);
  div.parentNode.removeChild(div);
  window.scrollTo(0, 0);
});

describe('Throttle', () => {
  it('should throttle scroll event by default', (done) => {
    const windowHeight = window.innerHeight + 1;
    ReactDOM.render(
      <div>
        <LazyLoad height={windowHeight}><Test height={windowHeight} /></LazyLoad>
        <LazyLoad height={windowHeight}><Test height={windowHeight} /></LazyLoad>
        <LazyLoad height={windowHeight}><Test height={windowHeight} /></LazyLoad>
      </div>
    , div);

    window.scrollTo(0, 10);

    setTimeout(() => {
      window.scrollTo(0, 9999);
    }, 50);

    setTimeout(() => {
      window.scrollTo(0, 10);
    }, 50);

    // let `scroll` event handler done their job first
    setTimeout(() => {
      expect(document.querySelectorAll('.test').length).to.equal(2);
      done();
    }, 500);
  });
});
