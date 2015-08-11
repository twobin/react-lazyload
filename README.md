# react-lazyload [![npm version](https://badge.fury.io/js/react-lazyload.svg)](http://badge.fury.io/js/react-lazyload)

Lazyload your Components, Images or anything matters the performance.

[Online Demo](//jasonslyvia.github.io/react-lazyload/examples/)

## Why it's better

 - Take performance in mind, only 2 event listeners for all lazy-loaded components
 - Support both `one-time lazy load` and `continuous lazy load` mode
 - IE 8 compatible

## Who should use it

Let's say there is a `fixed` date picker on the page, when user pick a different date, all components displaying data should send ajax request with new date parameter to retreive updated data, even many of them aren't visible in viewport. This makes server load furious when there are too many requests in one page.

Using `LazyLoad` component will help ease this situation by only update components in viewport.

## Usage

```
import React from 'react';
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
          <MyComponent />
        </LazyLoad>
        <LazyLoad once >       /* Once this component is loaded, LazyLoad will
                                  not care about it anymore, stuff like images
                                  should add `once` props to reduce listeners for
                                  scroll/resize event and improve performance */
          <MyComponent />
        </LazyLoad>
        <LazyLoad>
          <MyComponent />
        </LazyLoad>
        <LazyLoad>
          <MyComponent />
        </LazyLoad>
      </div>
    );
  }
});

React.render(<App />, document.body);
```

## Props

### once

Type: Bool Default: false

Once the lazy loaded component is loaded, do not detect scroll/resize event anymore. Useful for images or simple components.

## Scripts

```
$ npm run demo:watch
$ npm run build
```

## License

MIT
