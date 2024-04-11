# Note

This project is now currently maintained by
[@ameerthehacker](https://github.com/ameerthehacker), please reach out to him on any issues or help.

----

# react-lazyload [![Build Status](https://travis-ci.org/twobin/react-lazyload.svg)](https://travis-ci.org/twobin/react-lazyload) [![npm version](https://badge.fury.io/js/react-lazyload.svg)](http://badge.fury.io/js/react-lazyload) [![Coverage Status](https://coveralls.io/repos/github/jasonslyvia/react-lazyload/badge.svg?branch=master)](https://coveralls.io/github/jasonslyvia/react-lazyload?branch=master) [![npm downloads](https://img.shields.io/npm/dm/react-lazyload.svg)](https://www.npmjs.com/package/react-lazyload)

Lazyload your Components, Images or anything matters the performance.

[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-lazyload?tab=posts)

[Demo](//twobin.github.io/react-lazyload/examples/)

## Why it's better

 - Take performance in mind, only 2 event listeners for all lazy-loaded components
 - Support both `one-time lazy load` and `continuous lazy load` mode
 - `scroll` / `resize` event handler is throttled so you won't suffer frequent update, you can switch to debounce mode too
 - Decorator supported
 - Server Side Rendering friendly
 - Thoroughly tested

## Installation

> 2.0.0 is finally out, read [Upgrade Guide](https://github.com/twobin/react-lazyload/wiki/Upgrade-Guide), it's almost painless to upgrade!
> 3.0.0 fixes the findDomNode warning through usage of React ref, and the following are the changes you need to be aware of

* Now we have an extra div wrapping the lazy loaded component for the React ref to work
* We can understand that it is an extra DOM node, and we are working to optimize that if possible
* It might break your UI or snapshot tests based on your usage
* To customize the styling to the extra div please refer [here](#classNamePrefix)
* Found any other problem, please feel free to leave a comment over [here](https://github.com/twobin/react-lazyload/issues/310)

```
$ npm install --save react-lazyload
```

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import LazyLoad from 'react-lazyload';
import MyComponent from './MyComponent';

const App = () => {
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
};

ReactDOM.render(<App />, document.body);
```

If you want to have your component lazyloaded by default, try this handy decorator:

```javascript
import { lazyload } from 'react-lazyload';

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

## Special Tips

You should be aware that your component will only be mounted when it's visible in viewport, before that a placeholder will be rendered.

So you can safely send request in your component's `componentDidMount` without worrying about performance loss or add some pretty entering effects, see this [demo](https://twobin.github.io/react-lazyload/examples/#/fadein) for more detail.

## Props

### children

Type: Node Default: undefined

**NOTICE**
Only one child is allowed to be passed.

### scrollContainer

Type: String/DOM node Default: undefined

Pass a query selector string or DOM node. LazyLoad will attach to the window object's scroll events if no container is passed.

**NOTICE**
If scrollContainer is defined, the overflow option will be ignored.

### height

Type: Number/String Default: undefined

In the first round of render, LazyLoad will render a placeholder for your component if no placeholder is provided and measure if this component is visible. Set `height` properly will make LazyLoad calculate more precisely. The value can be number or string like `'100%'`. You can also use css to set the height of the placeholder instead of using `height`.

### once

Type: Bool Default: false

Once the lazy loaded component is loaded, do not detect scroll/resize event anymore. Useful for images or simple components.

### offset

Type: Number/Array(Number) Default: 0

Say if you want to preload a component even if it's 100px below the viewport (user have to scroll 100px more to see this component), you can set `offset` props to `100`. On the other hand, if you want to delay loading a component even if it's top edge has already appeared at viewport, set `offset` to negative number.

Library supports horizontal lazy load out of the box. So when you provide this prop with number like `100` it will automatically set left edge offset to `100` and top edge to `100`;

If you provide this prop with array like `[100, 200]`, it will set left edge offset to `100` and top offset to `200`.

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

[demo](https://twobin.github.io/react-lazyload/examples/#/overflow)

### placeholder

Type: Any Default: undefined

Specify a placeholder for your lazy loaded component.

[demo](https://twobin.github.io/react-lazyload/examples/#/placeholder)

**If you provide your own placeholder, do remember add appropriate `height` or `minHeight` to your placeholder element for better lazyload performance.**

### unmountIfInvisible

Type: Bool Default: false

The lazy loaded component is unmounted and replaced by the placeholder when it is no longer visible in the viewport.


### debounce/throttle

Type: Bool / Number Default: undefined

Lazyload will try to use [passive event](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md) by default to improve scroll/resize event handler's performance. If you prefer control this behaviour by yourself, you can set `debounce` or `throttle` to enable built in delay feature.

If you provide a number, that will be how many `ms` to wait; if you provide `true`, the wait time defaults to `300ms`.

**NOTICE** Set `debounce` / `throttle` to all lazy loaded components unanimously, if you don't, the first occurrence is respected.

[demo](https://twobin.github.io/react-lazyload/examples/#/debounce)

### classNamePrefix

Type: String Default: `lazyload`

While rendering, Lazyload will add some elements to the component tree in addition to the wrapped component children.

The `classNamePrefix` prop allows the user to supply their own custom class prefix to help:
    # Avoid class conflicts on an implementing app
    # Allow easier custom styling

These being:
    # A wrapper div, which is present at all times (default )

### style

Type: Object Default: undefined

Similar to [classNamePrefix](#classNamePrefix), the `style` prop allows users to pass custom CSS styles to wrapper div.

### wheel

**DEPRECATED NOTICE**
This props is not supported anymore, try set `overflow` for lazy loading in overflow containers.

## Utility

### forceCheck

It is available to manually trigger checking for elements in viewport. Helpful when LazyLoad components enter the viewport without resize or scroll events, e.g. when the components' container was hidden then become visible.

Import `forceCheck`:

```javascript
import { forceCheck } from 'react-lazyload';
```

Then call the function:

```javascript
forceCheck();
```

### forceVisible

Forces the component to display regardless of whether the element is visible in the viewport.

```javascript
import { forceVisible } from 'react-lazyload';
```

Then call the function:

```javascript
forceVisible();
```

## Scripts

```
$ npm run demo:watch
$ npm run build
```

## Who should use it

Let's say there is a `fixed` date picker on the page, when user picks a different date, all components displaying data should send ajax requests with new date parameter to retreive updated data, even many of them aren't visible in viewport. This makes server load furious when there are too many requests in one time.

Using `LazyLoad` component will help ease this situation by only updating components visible in viewport.

## Contributors

1. [lancehub](https://github.com/lancehub)
2. [doug-wade](https://github.com/doug-wade)
3. [ameerthehacker](https://github.com/ameerthehacker)


## License

MIT
