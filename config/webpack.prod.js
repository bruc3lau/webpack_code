// nodejs核心模块，直接使用
const os = require("os");
// Node.js的核心模块，专门用来处理文件路径
// cpu核数
const threads = os.cpus().length;
const path = require("path");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

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
  // entry: {
  //   main: "./src/main.js",
  //   app: "./src/app.js",
  // },
  entry: "./src/main.js",
  // 输出
  output: {
    path: path.resolve(__dirname, "../dist"), // 生产模式需要输出
    filename: "static/js/[name].js", // 入口文件打包输出资源命名方式
    chunkFilename: "static/js/[name].chunk.js", // 动态导入输出资源命名方式
    assetModuleFilename: "static/media/[name].[hash][ext]", // 图片、字体等资源命名方式（注意用hash）
    clean: true,
  },
  // 加载器
  module: {
    rules: [{
      "oneOf": [
        {
          // 用来匹配 .css 结尾的文件
          test: /\.css$/,
          // use 数组里面 Loader 执行顺序是从右到左
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
        },
        {
          test: /\.s[ac]ss$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.styl$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024 // 小于10kb的图片会被base64处理
            }
          },
          // generator: {
          //   // 将图片文件输出到 static/imgs 目录中
          //   // 将图片文件命名 [hash:8][ext][query]
          //   // [hash:8]: hash值取8位
          //   // [ext]: 使用之前的文件扩展名
          //   // [query]: 添加之前的query参数
          //   filename: "static/imgs/[hash:8][ext][query]",
          // },
        }, {
          test: /\.(ttf|woff2?|map4|map3|avi)$/,
          type: "asset/resource",
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024 // 小于10kb的图片会被base64处理
            }
          },
          // generator: {
          //   // 将图片文件输出到 static/imgs 目录中
          //   // 将图片文件命名 [hash:8][ext][query]
          //   // [hash:8]: hash值取8位
          //   // [ext]: 使用之前的文件扩展名
          //   // [query]: 添加之前的query参数
          //   filename: "static/media/[hash:8][ext][query]",
          // },
        }, {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          }
        }, {
          test: /\.js$/,
          // exclude: /node_modules/, // 排除node_modules代码不编译
          include: path.resolve(__dirname, "../src"), // 也可以用包含
          use: [
            {
              loader: "thread-loader", // 开启多进程
              options: {
                workers: threads, // 数量
              },
            },
            {
              loader: "babel-loader",
              options: {
                cacheDirectory: true, // 开启babel编译缓存
                cacheCompression: false, // 缓存文件不要压缩
                plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
              },
            },
          ],
        },
      ]
    }],
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true, // 开启缓存
      // 缓存目录
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
      threads,
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].css",
      chunkFilename: "static/css/[name].chunk.css", // 动态导入输出资源命名方式
    }),
    new CssMinimizerPlugin(),
    // 压缩图片
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            [
              "svgo",
              {
                plugins: [
                  "preset-default",
                  "prefixIds",
                  {
                    name: "sortAttrs",
                    params: {
                      xmlnsOrder: "alphabetical",
                    },
                  },
                ],
              },
            ],
          ],
        },
      },
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // css压缩也可以写到optimization.minimizer里面，效果一样的
      new CssMinimizerPlugin(),
      // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
      new TerserPlugin({
        parallel: threads // 开启多进程
      })
    ],
    // 代码分割配置
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // cacheGroups: { // 组，哪些模块要打包到一个组
      //   defaultVendors: { // 组名
      //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
      //     priority: -10, // 权重（越大越高）
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
      //   },
      //   default: { // 其他没有写的配置会使用上面的默认值
      //     minChunks: 2, // 这里的minChunks权重更大
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },
      // 修改配置
      cacheGroups: {
        // 组，哪些模块要打包到一个组
        // defaultVendors: { // 组名
        //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
        //   priority: -10, // 权重（越大越高）
        //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
        // },
        default: {
          // 其他没有写的配置会使用上面的默认值
          // minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  // 模式
  mode: "production", // 开发模式
  devtool: "source-map",
};