# react-lazyload [![Build Status](https://travis-ci.org/jasonslyvia/react-lazyload.svg)](https://travis-ci.org/jasonslyvia/react-lazyload)[![npm version](https://badge.fury.io/js/react-lazyload.svg)](http://badge.fury.io/js/react-lazyload)

Lazyload your Components, Images or anything matters the performance.

[Online Demo](//jasonslyvia.github.io/react-lazyload/examples/)

## Why it's better

 - Take performance in mind, only 2 event listeners for all lazy-loaded components
 - Support both `one-time lazy load` and `continuous lazy load` mode
 - `wheel` / `mousewheel` / `resize` event handler is debounced so you won't suffer frequent update
 - IE 8 compatible
 - Decorator supported

## Who should use it

Let's say there is a `fixed` date picker on the page, when user pick a different date, all components displaying data should send ajax request with new date parameter to retreive updated data, even many of them aren't visible in viewport. This makes server load furious when there are too many requests in one page.

Using `LazyLoad` component will help ease this situation by only update components in viewport.

## Installation

```
$ npm install --save react-lazyload

// If you tend to support React v0.13, you should use v0.2.4 which is the
// latest compatible version
$ npm install --save react-lazyload@0.2.4
```

## Usage

```javascript
import React from 'react';
import ReacrDOM from 'react-dom';
import LazyLoad from 'react-lazyload';
import MyComponent from './MyComponent';

const App = React.createClass({
  render() {
    return (
      <div className="list">
        <LazyLoad>
          <MyComponent />
        </LazyLoad>
        <LazyLoad>
          <img src="tiger.jpg" height="200" />
                                /*
                                  Lazy loading images is supported out of box,
                                  no extra config needed, set `height` for better
                                  experience
                                 */
        </LazyLoad>
        <LazyLoad once >        /* Once this component is loaded, LazyLoad will
                                   not care about it anymore, set this to `true`
                                   if you're concerned about improving performance */
          <MyComponent />
        </LazyLoad>
        <LazyLoad offset={100}> /* This component will be loaded when it's top
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
  once: true,
  offset: 100
})
class MyComponent extends React.Component {
  render() {
    return <div>this component is lazyloaded by default!</div>;
  }
}
```

## Props

### once

Type: Bool Default: false

Once the lazy loaded component is loaded, do not detect scroll/resize event anymore. Useful for images or simple components.

### offset

Type: Number/Array(Number) Default: 0

Say if you want to preload a module even if it's 100px below the viewport (user have to scroll 100px more to see this module), you can set `offset` props to `100`. On the other hand, if you want to delay loading a module even if it's top edge has already appeared at viewport, set `offset` props to negative number will make it delay loading.

If you provide this props with array like `[200, 200]`, it will set top edge offset and bottom edge offset respectively.

### scroll

Type: Bool Default: true

ONLY SET THIS TO `false` IF YOU SET `wheel` PROPS `true`.

### overflow

Type: Bool Default: false

If lazy loading components inside a overflow container, set this to `true`. Also make sure a `position` property other than `static` has been set to your overflow container.

### resize

Type: Bool Default: false

Respond to `resize` event, set it to `true` if you do need LazyLoad listen resize event.

**NOTICE** If you tend to support legacy IE, set this props carefully, refer to [this question](http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer) for further reading.

### debounce

Type: Bool / Number Default: true

By default, LazyLoad will have all event handlers debounced in 300ms for better performance. You can disable this by setting `debounce` to `false`, or change debounce time by setting a number value.

### throttle

Type: Bool / Number Default: false

If you prefer `throttle` rather than `debounce`, you can set this props to `true` or provide a specific number.

**NOTICE** Set `debounce` / `throttle` to all lazy loaded components unanimously.


## Props added to children

Like the example above, `<MyComponent>` will get following extra props:

### visible

Type: Bool

Is component currently visible

### firstTimeVisible

Is component first time visible, useful for children component's `componentWillReceiveProps` detect whether or not should query new data.

## Scripts

```
$ npm run demo:watch
$ npm run build
```

## Contributors

1. [lancehub](https://github.com/lancehub)


## License

MIT
