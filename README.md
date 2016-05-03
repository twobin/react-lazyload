# react-lazyload [![Build Status](https://travis-ci.org/jasonslyvia/react-lazyload.svg)](https://travis-ci.org/jasonslyvia/react-lazyload) [![npm version](https://badge.fury.io/js/react-lazyload.svg)](http://badge.fury.io/js/react-lazyload) [![Coverage Status](https://coveralls.io/repos/github/jasonslyvia/react-lazyload/badge.svg?branch=master)](https://coveralls.io/github/jasonslyvia/react-lazyload?branch=master)

Lazyload your Components, Images or anything matters the performance.

[Online Demo](//jasonslyvia.github.io/react-lazyload/examples/)

## Why it's better

 - Take performance in mind, only 2 event listeners for all lazy-loaded components
 - Support both `one-time lazy load` and `continuous lazy load` mode
 - `scroll` / `resize` event handler is throttled so you won't suffer frequent update, you can switch to debounce mode too
 - Decorator supported
 - Thoroughly tested

## Installation

> 2.0.0 is finally out, read [Upgrade Guide](https://github.com/jasonslyvia/react-lazyload/wiki/Upgrade-Guide), it's almost painless to upgrade!

```
$ npm install --save react-lazyload
```

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import LazyLoad from 'react-lazyload';
import MyComponent from './MyComponent';

const App = React.createClass({
  render() {
    return (
      <div className="list">
        <LazyLoad height={200}>
          <img src="tiger.jpg" /> /*
                                    Lazy loading images is supported out of box,
                                    no extra config needed, set `height` for better
                                    experience
                                   */
        </LazyLoad>
        <LazyLoad height={200} once >        
                                  /* Once this component is loaded, LazyLoad will
                                   not care about it anymore, set this to `true`
                                   if you're concerned about improving performance */
          <MyComponent />
        </LazyLoad>
        <LazyLoad height={200} offset={100}> 
                                /* This component will be loaded when it's top
                                   edge is 100px from viewport. It's useful to
                                   make user ignorant about lazy load effect. */
          <MyComponent />
        </LazyLoad>
        <LazyLoad>
          <MyComponent />
        </LazyLoad>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.body);
```

If you want to have your component lazyloaded by default, try this handy decorator:

```javascript
import {lazyload} from 'react-lazyload';

@lazyload({
  height: 200,
  once: true,
  offset: 100
})
class MyComponent extends React.Component {
  render() {
    return <div>this component is lazyloaded by default!</div>;
  }
}
```

You should aware that your component will only be mounted when it's visible in viewport, before that a placeholder will be rendered. 

So you can safely send request in your component's `componentDidMount` without worring about performance loss or add some pretty entering effect, see this [demo](https://jasonslyvia.github.io/react-lazyload/examples/#/fadein) for more detail.

## Props

### height

Type: Number Default: 100 Required: true

In the first round of render, LazyLoad will render a placeholder for your component and measure if this component is visible. Set `height` properly will make LazyLoad calculate more precisely.

### once

Type: Bool Default: false

Once the lazy loaded component is loaded, do not detect scroll/resize event anymore. Useful for images or simple components.

### offset

Type: Number/Array(Number) Default: 0

Say if you want to preload a module even if it's 100px below the viewport (user have to scroll 100px more to see this module), you can set `offset` props to `100`. On the other hand, if you want to delay loading a module even if it's top edge has already appeared at viewport, set `offset` props to negative number will make it delay loading.

If you provide this props with array like `[200, 200]`, it will set top edge offset and bottom edge offset respectively.

### scroll

Type: Bool Default: true

Listen and react to scroll event.

### resize

Type: Bool Default: false

Respond to `resize` event, set it to `true` if you do need LazyLoad listen resize event.

**NOTICE** If you tend to support legacy IE, set this props carefully, refer to [this question](http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer) for further reading.

### overflow

Type: Bool Default: false

If lazy loading components inside a overflow container, set this to `true`. Also make sure a `position` property other than `static` has been set to your overflow container.

[demo](https://jasonslyvia.github.io/react-lazyload/examples/#/overflow)

### debounce

Type: Bool / Number Default: true

By default, LazyLoad will have all event handlers debounced in 300ms for better performance. You can disable this by setting `debounce` to `false`, or change debounce time by setting a number value.

[demo](https://jasonslyvia.github.io/react-lazyload/examples/#/debounce)

### throttle

Type: Bool / Number Default: false

If you prefer `throttle` rather than `debounce`, you can set this props to `true` or provide a specific number.

**NOTICE** Set `debounce` / `throttle` to all lazy loaded components unanimously, if you don't, the first occurrence is respected.

### placeholder

Type: Any Default: undefined

Specify a placeholder for your lazy loaded component.

[demo](https://jasonslyvia.github.io/react-lazyload/examples/#/placeholder)

**If you provide your own placeholder, do remember add appropriate `height` or `minHeight` to your placeholder element for better lazyload performance.**


## Scripts

```
$ npm run demo:watch
$ npm run build
```

## Who should use it

Let's say there is a `fixed` date picker on the page, when user pick a different date, all components displaying data should send ajax request with new date parameter to retreive updated data, even many of them aren't visible in viewport. This makes server load furious when there are too many requests in one page.

Using `LazyLoad` component will help ease this situation by only update components in viewport.

## Contributors

1. [lancehub](https://github.com/lancehub)


## License

MIT
