const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  // Note: 
  // Chrome MV3 no longer allowed remote hosted code
  // Using module bundlers we can add the required code for your extension
  // Any modular script should be added as entry point
  entry: {
    Firebase_Config: './src/sidebar/firebase.js',
    script: './src/sidebar/script.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        use: ['file-loader'],
      },
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel loader for JavaScript files
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "LandingPage.html"),
      filename: "LandingPage.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "InputNumberPage.html"),
      filename: "InputNumberPage.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "SuccessRegister.html"),
      filename: "SuccessRegister.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "StudentInputPage.html"),
      filename: "StudentInputPage.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "StudentAssessmentDetails.html"),
      filename: "StudentAssessmentDetails.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "FacultyDashboardPage.html"),
      filename: "FacultyDashboardPage.html",
      chunks: ["script"] // This is script from entry point
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "sidebar", "FacultySchedulePage.html"),
      filename: "FacultySchedulePage.html",
      chunks: ["script"] // This is script from entry point
    }),
    // Note: you can add as many new HtmlWebpackPlugin objects  
    // filename: being the html filename
    // chunks: being the script src
    // if the script src is modular then add it as the entry point above
    // Note: This is to copy any remaining files to bundler
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/service-worker.js' },
        { from: './src/stylesheet.css' }
      ],
    }),
  ],
  output: {
    // chrome load uppacked extension looks for files under dist/* folder
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
};