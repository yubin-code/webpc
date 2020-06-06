import { Api } from '@webpc/plug/types'
import chalk from 'chalk';
export default (api: Api) => {
 api.onHelp(() => {
   console.log([
     '',
     `Usage: webpc <command>`,
     '',
     'Commands:',
     '',
     `  ${chalk.cyan('init')}     初始化项目`,
     `  ${chalk.cyan('build')}    打包应用程序`,
     `  ${chalk.cyan('dev')}      启动服务器进行开发`,
     `  ${chalk.cyan('-h')}       显示帮助`,
     `  ${chalk.cyan('-v')}       显示版本`,
     "",
     `详细内容 ${chalk.whiteBright('https://github.com/yubin-code/webpc')}`,
     ""
  ].join('\n'))
 })
}