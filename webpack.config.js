'use strict';

var webpack = require('webpack');
var path = require('path');

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

var DEV_MODE = process.env.NODE_ENV !== 'production';

if (DEV_MODE) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  );
}
else {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

var entry = [
  './examples/app.js'
].concat(DEV_MODE ? [
  'webpack-dev-server/client?http://localhost:3000',
  'webpack/hot/only-dev-server'
] : []);


module.exports = {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel?stage=0&loose=all',
      exclude: /node_modules/
    }].concat(DEV_MODE ? [{
      test: /\.jsx?$/,
      loader: 'react-hot',
      exclude: /node_modules/
    }] : [])
  },

  entry: entry,

  watch: DEV_MODE,
  debug: DEV_MODE,
  devtool: DEV_MODE ? '#inline-source-map' : false,

  output: {
    path: path.join(__dirname, 'examples'),
    filename: 'bundle.js'
  },

  plugins: plugins,
  resolve: {
    extensions: ['', '.js']
  }
};
