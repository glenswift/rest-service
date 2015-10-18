'use strict';

var webpack = require('webpack'),
  pkg = require('./package.json');

module.exports = {
  entry: {
    main: './src/BaseRESTService.js'
  },
  output: {
    path: './dist',
    filename: 'rest-service.js'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader?experimental' 
    }]
  }

};
