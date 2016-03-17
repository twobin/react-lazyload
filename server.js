var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');
var path = require('path');

/**
 * Start dev server that serves static webpack compiled files
 */
var serverOptions = {
  quiet: false,
  noInfo: false,
  historyApiFallback: true,
  publicPath: config.output.publicPath,
  contentBase: path.join(__dirname, 'examples'),
  stats: {
    colors: true
  },
  host: 'webpack.dev'
};

var webpackDevServer = new WebpackDevServer(webpack(config), serverOptions);

webpackDevServer.listen(3000, 'localhost', function() {
  console.log('Webpack dev server listening on %s:%s', 'localhost', 3000);
});
