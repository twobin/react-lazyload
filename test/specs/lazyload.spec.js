/* eslint no-unused-expressions: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import LazyLoad, { lazyload } from '../../src/index';
import spies from 'chai-spies';
import Test from '../Test.component';
import * as event from '../../src/utils/event';

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

describe('LazyLoad', () => {
  describe('Basic setup', () => {
    it('should render passed children', () => {
      ReactDOM.render(<LazyLoad><span className="test"></span></LazyLoad>, div);
      expect(document.querySelector('.test')).to.exist;
    });

    it('should render `lazyload-placeholder` when children not visible', () => {
      ReactDOM.render(
        <div>
          <LazyLoad height={9999}><span className="something">123</span></LazyLoad>
          <LazyLoad height={9999}><span className="treasure">123</span></LazyLoad>
        </div>
      , div);

      expect(document.querySelector('.something')).to.exist;
      expect(document.querySelector('.lazyload-placeholder')).to.exist;
      expect(document.querySelector('.treasure')).to.not.exist;
    });

    it('should NOT update when invisble', (done) => {
      ReactDOM.render(
        <div>
          <LazyLoad height={9999}><Test height={9999} id={1} /></LazyLoad>
          <LazyLoad height={9999}><Test height={9999} id={2} /></LazyLoad>
        </div>
      , div);

      expect(document.querySelector('.test1 .times').textContent).to.equal('1');
      expect(document.querySelector('.test2')).to.not.exist;

      ReactDOM.render(
        <div>
          <LazyLoad height={9999}><Test height={9999} id={1} /></LazyLoad>
          <LazyLoad height={9999}><Test height={9999} id={2} /></LazyLoad>
        </div>
      , div);

      expect(document.querySelector('.test1 .times').textContent).to.equal('2');
      expect(document.querySelector('.test2')).to.not.exist;

      window.scrollTo(0, 99999);

      setTimeout(() => {
        expect(document.querySelector('.test2 .times').textContent).to.equal('1');

        ReactDOM.render(
          <div>
            <LazyLoad height={9999}><Test height={9999} id={1} /></LazyLoad>
            <LazyLoad height={9999}><Test height={9999} id={2} /></LazyLoad>
          </div>
        , div);

        expect(document.querySelector('.test1 .times').textContent).to.equal('2');
        expect(document.querySelector('.test2 .times').textContent).to.equal('2');
        done();
      }, 500);
    });

    it('should NOT controlled by LazyLoad when `once` and visible', (done) => {
      ReactDOM.render(
        <div>
          <LazyLoad height={9999} once><Test height={9999} id={1} /></LazyLoad>
          <LazyLoad height={9999} once><Test height={9999} id={2} /></LazyLoad>
        </div>
      , div);

      ReactDOM.render(
        <div>
          <LazyLoad height={9999} once><Test height={9999} id={1} /></LazyLoad>
          <LazyLoad height={9999} once><Test height={9999} id={2} /></LazyLoad>
        </div>
      , div);

      window.scrollTo(0, 99999);

      setTimeout(() => {
        ReactDOM.render(
          <div>
            <LazyLoad height={9999} once><Test height={9999} id={1} /></LazyLoad>
            <LazyLoad height={9999} once><Test height={9999} id={2} /></LazyLoad>
          </div>
        , div);

        // Differnce between the test above
        expect(document.querySelector('.test1 .times').textContent).to.equal('3');
        done();
      }, 500);
    });

    it('should render `placeholder` if provided', () => {
      ReactDOM.render(
        <div>
          <LazyLoad height={9999} placeholder={<div className="my-placeholder" style={{ height: '9999px' }}></div>}>
            <Test className="test" />
          </LazyLoad>
          <LazyLoad height={9999} placeholder={<div className="my-placeholder" style={{ height: '9999px' }}></div>}>
            <Test className="test" />
          </LazyLoad>
        </div>, div);

      expect(document.querySelector('.my-placeholder')).to.exist;
    });
  });

  describe('Checking visibility', () => {
    it('should consider visible when top edge is visible', () => {
      const windowHeight = window.innerHeight;
      ReactDOM.render(
        <div>
          <LazyLoad height={windowHeight - 1}><span className="something">123</span></LazyLoad>
          <LazyLoad height={1}><span className="treasure">123</span></LazyLoad>
        </div>
      , div);

      expect(document.querySelector('.something')).to.exist;
      expect(document.querySelector('.lazyload-placeholder')).to.not.exist;
      expect(document.querySelector('.treasure')).to.exist;
    });

    it('should render children when scrolled visible', (done) => {
      const windowHeight = window.innerHeight + 20;
      ReactDOM.render(
        <div>
          <LazyLoad height={windowHeight}><Test className="something" height={windowHeight}>123</Test></LazyLoad>
          <LazyLoad height={windowHeight}><Test className="treasure" height={windowHeight}>123</Test></LazyLoad>
        </div>
      , div);

      expect(document.querySelector('.lazyload-placeholder')).to.exist;
      window.scrollTo(0, 50);

      setTimeout(() => {
        expect(document.querySelector('.lazyload-placeholder')).to.not.exist;
        expect(document.querySelector('.treasure')).to.exist;
        done();
      }, 1000);
    });

    it('should work inside overflow container', (done) => {
      ReactDOM.render(
        <div style={{ height: '300px', overflow: 'auto' }} className="container">
          <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="something">123</div></LazyLoad>
          <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="something">123</div></LazyLoad>
          <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="treasure">123</div></LazyLoad>
        </div>
      , div);

      const container = document.querySelector('.container');
      expect(container.querySelector('.something')).to.exist;
      // tests run well locally, but not on travisci, need to dig it
      // @FIXME
      // expect(container.querySelector('.lazyload-placeholder')).to.exist;
      // expect(container.querySelector('.treasure')).to.not.exist;

      container.scrollTop = 200;
      // since scroll event is throttled, has to wait for a delay to make assertion
      setTimeout(() => {
        expect(container.querySelector('.lazyload-placeholder')).to.not.exist;
        expect(container.querySelector('.treasure')).to.exist;
        done();
      }, 500);
    });
  });

  describe('Decorator', () => {
    it('should work properly', () => {
      @lazyload({
        height: 9999
      })
      class Test extends React.Component {
        render() {
          return (
            <div className="test" style={{ height: '9999px' }}>{this.props.children}</div>
          );
        }
      }

      ReactDOM.render(
        <div>
          <Test>1</Test>
          <Test>2</Test>
          <Test>3</Test>
        </div>
      , div);

      expect(document.querySelectorAll('.test').length).to.equal(1);
      expect(document.querySelector('.lazyload-placeholder')).to.exist;
    });
  });

  describe('Overflow', () => {
    // https://github.com/jasonslyvia/react-lazyload/issues/71
    // http://stackoverflow.com/a/6433475/761124
    it('should not detect a overflow container when only one of the scroll property is auto\/scroll', () => {
      ReactDOM.render(
        <div
          id="realOverflowContainer"
          style={{ height: '600px', overflow: 'auto' }}
        >
          <div
            id="fakeOverflowContainer"
            style={{ height: '300px', overflowX: 'hidden' }}
            className="container"
          >
            <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="something">123</div></LazyLoad>
            <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="something">123</div></LazyLoad>
            <LazyLoad height={200} overflow><div style={{ height: '200px' }} className="treasure">123</div></LazyLoad>
          </div>
        </div>
      , div);

      const container = document.querySelector('.container');
      expect(container.querySelector('.something')).to.exist;
      expect(container.querySelector('.lazyload-placeholder')).not.to.exist;
      expect(container.querySelector('.treasure')).to.exist;
    });
  });

  describe('scrollContainer', () => {
    it('should focus on a different scroll container', (done) => {
      const $body = document.body;
      const $html = $body.parentNode;
      const $els = [$body, $html, div];
      setStyle('100%');
      ReactDOM.render(
        <div
          id="scroll-container"
          style={{ height: '100%', width: '100%', overflow: 'auto' }}>
          <div
            id="scroller"
            style={{ height: 10000 }}>
            <div
              id="spacer"
              style={{ height: 10000 - 200 }}></div>
            <LazyLoad
              height={200}
              scrollContainer="#scroll-container">
              <div id="content" style={{ height: 200, width: '100%' }}></div>
            </LazyLoad>
          </div>
        </div>
      , div);
      const $container = document.querySelector('#scroll-container');
      event.on($container, 'scroll', scroller);
      expect($container.querySelector('.lazyload-placeholder')).to.exist;
      expect($container.querySelector('#content')).not.to.exist;
      $container.scrollTop = $container.scrollHeight - window.innerHeight;

      function setStyle(value) {
        $els.forEach($el => {
          $el.style.height = value;
          $el.style.width = value;
        });
      }

      function scroller() {
        expect($container.querySelector('.lazyload-placeholder')).not.to.exist;
        expect($container.querySelector('#content')).to.exist;
        setStyle('');
        event.off($container, 'scroll', scroller);
        done();
      }
    });
  });
});
