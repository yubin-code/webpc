const path = require('path');
// 判断是否开发环境
const isDev = process.env.NODE_ENV === "development"

module.exports = {
  // 视图文件入口
  viewPath: "./src/view",
  // 打包后静态文件存放的目录 
  staticPath: "./static",
  
  // pages 页面配置
  pages: [
    {
      template: "index",
      /**
       * index 就是下面入口文件引入的index值是key
       * commons 是抽取的公用js查看以下配置
       */
      chunks:['index', 'commons']
    }
  ],

  // webpack 配置
  webpack: {
    resolve: {
      alias: {
        /**
         * 配置别名在js中就能使用以下方式引入文件
         * import '@/css/index.less'
         */
        '@': path.resolve(__dirname, './src')
      }
    },
    /**
     * 服务器配置
     * 因为使用的是官网的所以配置很丰富诸如代理自动打开浏览器等
     * 参考 https://www.webpackjs.com/configuration/dev-server/
     */
    devServer: {},
    /**
     * 配置参考
     * https://webpack.js.org/configuration/optimization/#root
     */
    optimization: {
      // 是否压缩js开发环境不压缩
      minimize: !isDev,
      splitChunks: {
        cacheGroups: {
          // 抽离第三方插件
          vendor: {
            // 指定是node_modules下的第三方包
            test: /[\\/]node_modules[\\/]/,
            // 打包后的文件名，任意命名  
            chunks: 'initial',
            //共用字节大于0即抽离
            minSize:0, 
            //引用2次就打包
            minChunks:2 
          },
          // 抽离自己写的公共代码，common这个名字可以随意起
          commons: {
            chunks: 'initial',
            // 只要超出0字节就生成一个新包
            minSize: 0,
            //引用2次就打包
            minChunks: 2
          }
        }
      }
    },
    /**
     * 这里使用的是 webpack-html-plugin 配置需要结合上面pages页面配置使用
     * 每一个 pages 就是一个 new HtmlWebpackPlugin()
     * 而这里html就是 pages公用属性所以一般pages配置模版就行了剩下交给html把
     * 主要注意的是 html 属性不支持 template 与 filename 设置
     * 参考 https://github.com/jantimon/html-webpack-plugin
     */
    html: {
      // 给包含的脚本和CSS文件后面附加哈希
      hash: true,
      // 页面的ico设置
      favicon: './src/assets/favicon.ico',
      /**
       * html 压缩配置
       * 参考 https://github.com/DanielRuf/html-minifier-terser
       */
      // 判断如果开发环境就不压缩html
      minify: isDev ? {} : {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    },
    /**
     * 是否使用rem编写代码
     * 设置了rem请把html页面的 <meta name="viewport" content="width=device-width, initial-scale=1.0">
     * !一定要删除,!一定要删除,!一定要删除
     * 标签不去除去会导致页面的rem值错乱
     * 设计图是750就设置 75
     * 设计图是375就设置37.5
     * 支持json 详细配置请查阅 https://www.npmjs.com/package/postcss-plugin-px2rem
     * 不填写则不启用rem
     */
    // rem: 75,

    /**
     * css 配置
     */
    css: {
      // 是否把样式直接插入到页面中而不生成css文件
      styleLoader: false,
      name: "css/[name].ui.css",
      // 是否压缩css
      uglify: !isDev
    },
    // js 入口
    entry: {
      index: "./src/js/index.js",
    },
    // 打包出口配置
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'js/[name].[hash].index.js',
    },
  },
}