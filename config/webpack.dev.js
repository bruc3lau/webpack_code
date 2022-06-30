// Node.js的核心模块，专门用来处理文件路径
const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: "./src/main.js",
  // 输出
  output: {
    path: undefined,
    filename: "static/js/main.js", // 将 js 文件输出到 static/js 目录中,
    clean: true, // 自动将上次打包目录资源清空

  },
  // 加载器
  module: {
    rules: [{
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    }, {
      test: /\.less$/i,
      use: [
        // compiles Less to CSS
        "style-loader",
        "css-loader",
        "less-loader",
      ],
    }, {
      test: /\.s[ac]ss$/i,
      use: [
        // Creates `style` nodes from JS strings
        "style-loader",
        // Translates CSS into CommonJS
        "css-loader",
        // Compiles Sass to CSS
        "sass-loader",
      ],
    }, {
      test: /\.styl$/,
      use: [
        {
          loader: "style-loader",
        },
        {
          loader: "css-loader",
        },
        {
          loader: "stylus-loader",
        },
      ],
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
  ],
  // 开发服务器
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },
  // 模式
  mode: "development", // 开发模式
  // mode: "production", // 开发模式
};