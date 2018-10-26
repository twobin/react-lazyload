/* eslint-disable */
'use strict';

var webpack = require('webpack');
var path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

var DEV_MODE = process.env.NODE_ENV !== 'production';

if (!DEV_MODE) {
  plugins.push(
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false
      },
      sourceMap: true
    })
  );
}

module.exports = {
  mode: DEV_MODE ? 'development' : 'production',
  entry:  {
    app: path.resolve(__dirname, './examples/app.js')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
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
    extensions: ['.js', '.jsx']
  }
};
