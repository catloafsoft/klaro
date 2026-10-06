const path = require('path');

module.exports = (_env, argv) => ({
  mode: argv.mode || 'production',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    hot: true,
    compress: true,
    port: 9000,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    historyApiFallback: true,
    client: {
      overlay: true,
    }
  },
});
