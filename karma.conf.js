'use strict';

module.exports = function (config) {
  config.set({

    basePath: '',

    files: [
      'test/main/*.test.js'
    ],

    frameworks: ['mocha'],

    preprocessors: {
      'test/main/*.test.js': ['webpack']
    },

    reporters: ['mocha'],

    webpack: {
      debug: true,
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader?experimental'
        }]
      }
    },

    webpackMiddleware: {
      stats: false
    },

    autoWatch: true,
    browsers: ['PhantomJS']

  });
};