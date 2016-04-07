/* eslint-disable */
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

if (!DEV_MODE) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
}

module.exports = {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel?stage=0&loose=all',
      exclude: /node_modules/
    }]
  },

  entry: {
    app: './examples/app.js',
  },

  watch: DEV_MODE,
  devtool: DEV_MODE ? 'inline-source-map' : 'source-map',

  output: {
    path: path.join(__dirname, 'examples/js/'),
    filename: 'bundle.min.js',
    publicPath: '/js/'
  },

  plugins: plugins,
  resolve: {
    extensions: ['', '.js']
  }
};
