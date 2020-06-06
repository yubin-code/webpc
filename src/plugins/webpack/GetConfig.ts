import { existsSync } from 'fs'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import path from 'path'
import Config from 'webpack-chain'
import { Api } from '@webpc/plug/types'
import css from './Css'
import _ from 'lodash'

interface pagesType {
  template: string;
  filename: string;
  [key:string]: string;
}

/**
 * 设置config通知父级框架
 * @param api 
 */
const setConfig = (api: Api) => {
  // 导出内置配置
  api.register({
    key: 'getWebpackConfig',
    fn() {
      return conf(api.cwd, api.userConfig, api.env === "development");
    },
  });
  
  // 获取用户配置
  api.register({
    key: 'getWebpackConfig',
    fn() {
      const webapck = api.userConfig.webpack || {}
      // 剔除webpack上没有的属性不然回报错
      Object.keys(webapck).forEach(v => {
        if([
          'css',
          'html',
          'rem',
        ].indexOf(v) >= 0){
          delete webapck[v]
        }
      })
      return webapck
    },
  });
}

// 设置html页面的插件
const htmlPlugin = (config:Config, data:any) => {
  config.plugin(`html-plugin-${data.filename}`)
    .use(require.resolve('html-webpack-plugin'), [ data ])
}

/**
 * 把用户的路由转为模版文件路径
 * @param cwd 执行命令目录
 * @param viewPath 模版路径
 * @param pages 页面
 */
const getFilePath = (cwd:string, viewPath: string, pages: any) => {

  // 判断页面参数是否合理
  if(!_.isArray(pages)){
    return []
  }

  // 循环路由
  const files:pagesType[] = []
  pages.forEach(item => {
    let template = ""
    // 对字符串处理
    if(_.isString(item)){
      template = item
    }else {
      template = item.template
    }
    
    const viewPaths = path.join(cwd, viewPath, `${template}.ejs`)
    // 过滤不存在的模版文件配置信息
    if(existsSync(viewPaths)){
      files.push({...item, template: viewPaths, filename: template })
    }
  })

  return files
}

// 生产环境下一些配置
const production = (cwd:string, config:Config, userConfig:any) => {
  // const webpackConfig =  userConfig.webpack || {}

  // 压缩js
  config.optimization.minimize(true);

  // 删除生产的目录
  config.plugin('clean').use(CleanWebpackPlugin)
}

const conf = (cwd:string, userConfig:any, isDev: boolean):webpack.Configuration => {
  const config = new Config();
  const webpackConfig =  userConfig.webpack || {}
  const staticPath = userConfig.staticPath || 'static'
  // 支持js
  const js = config.module.rule('js').test(/\.(js)$/);
  if(!_.isUndefined(webpackConfig.rem)){
    js.use('lib-flexible').loader(require.resolve('./Rem'));
  }

  js.include.add(cwd).end()
    .exclude.add(/node_modules/).end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options({ presets: ['@babel/preset-env'] });

  
  // 支持ts
  const ts = config.module.rule('ts').test(/\.ts?$/);
  if(!_.isUndefined(webpackConfig.rem)){
    ts.use('lib-flexible').loader(require.resolve('./Rem'));
  }
  ts.include.add(cwd).end()
    .exclude.add(/node_modules/).end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({
      configFile: path.resolve(cwd, './tsconfig.json')
    })

  // 支持ejs
  config.module
    .rule('ejs')
    .test(/\.ejs?$/)
    .include.add(cwd).end()
    .exclude.add(/node_modules/).end()
    .use('underscore-template-loader')
    .loader(require.resolve('underscore-template-loader'))
    
  // prettier-ignore
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp|ico)(\?.*)?$/)
    .use('url-loader')
      .loader(require.resolve('url-loader'))
      .options({
        limit: 10000,       // 小于1KB的时候转为bash64
        name: `${staticPath}/[name].[hash:8].[ext]`,
        // require 图片的时候不用加 .default
        esModule: false,
        fallback: {
          loader: require.resolve('file-loader'),
          options: {
            name: `${staticPath}/[name].[hash:8].[ext]`,
            esModule: false,
          },
        }
      });

  // prettier-ignore
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: `${staticPath}/[name].[hash:8].[ext]`,
        esModule: false,
      });
  
  // prettier-ignore
  config.module
    .rule('fonts')
    .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: `${staticPath}/[name].[hash:8].[ext]`,
        esModule: false,
      });

  config.resolve.extensions.merge([
    '.ts',
    '.tsx',
    '.js'
  ])

  // css 处理
  css({
    rem: webpackConfig.rem,
    css: webpackConfig.css,
    webpackConfig: config,
    isDev,
  })
  
  
  // 循环所有文件配置
  const files = getFilePath(cwd, userConfig.viewPath, userConfig.pages) || [];

  // 获取html配置
  const html = webpackConfig.html || {}
  const htmlPath = html.path && `${html.path}/` || ''

  files.forEach(value => {
    value.filename = `${htmlPath}${value.filename}.html`
    value.favicon = path.join(cwd, (html.favicon || value.favicon))
    htmlPlugin(config, {...html, ...value })
  })

  if(!isDev){
    production(cwd, config, userConfig)
  }

  return config.toConfig()
}

export {
  setConfig
}
export default conf