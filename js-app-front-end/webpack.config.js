var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: { path: path.join(__dirname, '..', 'assets', 'js-app'), filename: 'front-end-app.js' },
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