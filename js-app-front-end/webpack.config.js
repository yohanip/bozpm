var path = require('path');
var webpack = require('webpack');
var minimize = process.argv.indexOf('--minimize') !== -1,
  plugins = [];

if (minimize) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {warnings: false}
  }));
}

module.exports = {
  entry: './main.js',
  output: {path: path.join(__dirname, '..', 'assets', 'js-app'), filename: 'front-end-app.js'},
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-2']
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      }
    ]
  },
};