// Node.js的核心模块，专门用来处理文件路径
const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

function getStyleLoaders(pre) {
  return [
    // compiles Less to CSS
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    pre
  ].filter(Boolean)
}

module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: "./src/main.js",
  // 输出
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "static/js/main.js", // 将 js 文件输出到 static/js 目录中,
    clean: true, // 自动将上次打包目录资源清空
  },
  // 加载器
  module: {
    rules: [{
      test: /\.css$/i,
      use: getStyleLoaders()
    }, {
      test: /\.less$/i,
      use: getStyleLoaders("less-loader")
    }, {
      test: /\.s[ac]ss$/i,
      use: getStyleLoaders("sass-loader")
    }, {
      test: /\.styl$/,
      use: getStyleLoaders("stylus-loader")
    }, {
      test: /\.(png|jpe?g|gif|webp)$/,
      type: "asset",
      parser: {
        dataUrlCondition: {
          maxSize: 2 * 1024 // 小于10kb的图片会被base64处理
        }
      }, generator: {
        // 将图片文件输出到 static/imgs 目录中
        // 将图片文件命名 [hash:8][ext][query]
        // [hash:8]: hash值取8位
        // [ext]: 使用之前的文件扩展名
        // [query]: 添加之前的query参数
        filename: "static/imgs/[hash:8][ext][query]",
      },
    }, {
      test: /\.(ttf|woff2?|map4|map3|avi)$/,
      type: "asset/resource",
      parser: {
        dataUrlCondition: {
          maxSize: 2 * 1024 // 小于10kb的图片会被base64处理
        }
      }, generator: {
        // 将图片文件输出到 static/imgs 目录中
        // 将图片文件命名 [hash:8][ext][query]
        // [hash:8]: hash值取8位
        // [ext]: 使用之前的文件扩展名
        // [query]: 添加之前的query参数
        filename: "static/media/[hash:8][ext][query]",
      },
    }, {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
      }
    }],
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      context: path.resolve(__dirname, "../src")
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/main.css",
    }),
    new CssMinimizerPlugin(),
  ],
  // 模式
  mode: "production", // 开发模式
};