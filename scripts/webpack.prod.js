const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../docs'),
    publicPath: 'erikvullings.github.io/taalgenie',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
  ]
});
