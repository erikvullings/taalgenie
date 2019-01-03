const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins

const title = 'Taalgenie';

module.exports = {
  entry: {
    app: './src/app.ts',
    // print: './src/print.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            reportFiles: ['src/**/*.{ts,tsx}'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'url-loader?limit=8192', // 'file-loader' is used as url-loader fallback anyways
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              attrs: [':data-src'],
            },
          },
          {
            loader: 'markdown-loader',
            options: {
              pedantic: true,
              gfm: true,
              tables: true,
              breaks: false,
              pedantic: false,
              sanitize: false,
              smartLists: true,
              smartypants: true,
              headerIds: true,
              headerPrefix: 'header-',
              langPrefix: 'lang-',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
  },
  plugins: [new webpack.ProgressPlugin(), new CleanWebpackPlugin(['dist']), new HtmlWebpackPlugin({ title: title })],
};
