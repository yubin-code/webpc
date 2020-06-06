import Config from 'webpack-chain';
import _ from 'lodash';
// @ts-ignore

export enum BundlerConfigType {
  csr = 'csr',
  ssr = 'ssr',
}

export type IBundlerConfigType = keyof typeof BundlerConfigType;
export interface RemType {
  /**
   * 实现rem换算
   * 设计图是750就设置 75
   * 设计图是375就设置37.5
   * 默认是100
   */
  rootValue?: number;
  // 允许REM单位增长到的十进制数字。
  unitPrecision?: number;
  // 默认值是一个空数组，这意味着禁用白名单并启用所有属性。
  propWhiteList?: string[];
  //黑名单
  propBlackList?:string[],
  // //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，
  // 例如/(node_module)\/如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
  exclude?: RegExp;
  // 要忽略并保留为px的选择器
  selectorBlackList?: string[];
  //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
  ignoreIdentifier?: boolean;
  // （布尔值）替换包含REM的规则，而不是添加回退。
  replace?: boolean;
  //（布尔值）允许在媒体查询中转换px。
  mediaQuery?: boolean;
  //设置要替换的最小像素值(3px会被转rem)。 默认 0
  minPixelValue?: number;
} 

interface IOpts {
  // webpack 配置
  webpackConfig: Config;
  /**
   * 实现rem换算
   * 设计图是750就设置 75
   * 设计图是375就设置37.5
   * rem: number || {}
   */
  rem?: number|RemType;
  // css 配置
  css?: {
    name?: string;        // css名字
    uglify?: string;      // 是否压缩css
    styleLoader?: boolean;// 是否把样式直接插入到页面中
  };
  isDev: boolean;         // 是否开发环境
}

interface ICreateCSSRuleOpts extends IOpts {
  lang: string;       // 语言
  test: RegExp;       // 匹配什么结尾到文件
  loader?: string;    // 加载器是什么
  options?: object;   // 选项
}

export function createCSSRule({
  webpackConfig,
  lang,
  test,
  loader,
  options,
  isDev,
  css,
  rem,
}: ICreateCSSRuleOpts) {
  const rule = webpackConfig.module.rule(lang).test(test);

  // 是否使用style-loader 先不支持
  if(isDev || css?.styleLoader){
    rule
      .use('style-loader')
      .loader(require.resolve('style-loader'))
      .options({
          base: 0,
        },
      );
  }else {
    // 这里需要注意 style-loader 跟 extract-css-loader 不能同时使用所有我们需要else判断
    // 不是开发环境才使用增加编译效率
    if(!isDev){
      rule
      .use('extract-css-loader')
      .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
      .options({
        publicPath: './',
      });
    }
  }
  // 自动添加前缀
  const postcssPlugins = [require('postcss-preset-env')()]

  // 判断rem是否存在
  if(!_.isUndefined(rem)){
    /**
     * 因为rem允许用户直接设置数字或者参数所有需要添加这个判断
     */
    const opts = _.isNumber(rem) ? {
      rootValue: rem,
      exclude:"/node_modules/i",
    } : rem;
    // 添加rem
    postcssPlugins.push(require('postcss-plugin-px2rem')(opts))
  }

  rule
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options({ importLoaders: 1 });
    
  rule
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
    .options(
      { ident: 'postcss', plugins: () => postcssPlugins }
    );
      
  if (loader) {
    rule
      .use(loader)
      .loader(require.resolve(loader))
      .options(options || {});
  }
}



export default function ({
  webpackConfig,
  isDev,
  rem,
  css={},
}: IOpts) {
  
  // css
  createCSSRule({
    webpackConfig,
    lang: 'css',
    test: /\.(css)(\?.*)?$/,
    isDev,
    css,
    rem
  });

  // less
  createCSSRule({
    webpackConfig,
    lang: 'less',
    test: /\.(less)(\?.*)?$/,
    loader: 'less-loader',
    isDev,
    css,
    rem
  });


  /**
   * 打包的时候才执行
   * 并且styleLoader内联样式没有开启
   */
  if(!isDev && !css.styleLoader){
    // 单独打包css文件
    webpackConfig
      .plugin('extract-css')
      .use(
        require.resolve('mini-css-extract-plugin'),
        [
          {
            filename: css.name || `css/[name].css`,
            chunkFilename: css.name || `[name].chunk.css`,
            ignoreOrder: true,
          },
        ],
      );
  }
  
  // 打包的时候才执行
  if(!isDev && css.uglify){
    // 打包的时候使用优化减少css
    webpackConfig
      .plugin('optimize-css')
      .use(require.resolve('optimize-css-assets-webpack-plugin'), [
        {
          cssProcessorPluginOptions: {
            preset: ['default'],
          },
        },
      ]);
  }
}
