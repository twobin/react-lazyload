# react-lazyload

Lazyload your Component, Image or anything matters the performance.

**Work in progress, use at your own risk!!**

[Online Demo](//jasonslyvia.github.io/react-lazyload/examples/)

## Why it's better

 - Take performance in mind, only 2 event listeners for all lazy-loaded components
 - Support both `one-time lazy load` and `continuous lazy load` mode
 - IE 8 compatible

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
        <LazyLoad>
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

### Once

Type: Bool Default: false

Once the lazy loaded component is mounted, do not detect scroll/resize event anymore. Useful for images or simple components.

## Scripts

```
$ npm run demo
$ npm run build
```

## License

MIT
