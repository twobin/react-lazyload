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

describe('Debounce', () => {
  it('should debounce when `debounce` is set', (done) => {
    const windowHeight = window.innerHeight + 20;
    ReactDOM.render(
      <div>
        <LazyLoad height={windowHeight} debounce><Test height={windowHeight} /></LazyLoad>
        <LazyLoad height={windowHeight} debounce><Test height={windowHeight} /></LazyLoad>
        <LazyLoad height={windowHeight} debounce><Test height={windowHeight} /></LazyLoad>
      </div>
    , div);

    window.scrollTo(0, 9999);

    setTimeout(() => {
      window.scrollTo(0, 9999);
    }, 30);

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 60);

    setTimeout(() => {
      window.scrollTo(0, 9999);
    }, 90);

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 120);

    // let `scroll` event handler done their job first
    setTimeout(() => {
      expect(document.querySelectorAll('.test').length).to.equal(1);
      expect(document.querySelector('.lazyload-placeholder')).to.exist;
      done();
    }, 500);
  });
});
