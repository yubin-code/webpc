import { Api } from '@webpc/plug/types'
import Detection from './Detection'
import chalk from 'chalk';

export default (api: Api) => {
  // 不是开发环境下面的都不用运行了
  if(api.env !== "development"){
    return
  }

  api.onDev(() => {
    let viewPath = api.userConfig?.viewPath || "./src/view"
    let timer:any = null

    // 如果用户添加 / 那么就直接删除
    if(viewPath.charAt(viewPath.length - 1) === "/"){
      viewPath = viewPath.substr(0, viewPath.length - 1); 
    }

    const paths = [`${viewPath}/**/*.ejs`]

    // 配置了配置文件才添加配置文件监控
    if(api.configName){
      paths.push(api.configName)
    }

    // 实例文件监控
    const detection = new Detection({ cwd: api.cwd, paths })

    const timing = (isconsole?: boolean) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if(isconsole){
          console.log([
            "",
            chalk.green('配置文件被修改服务正在重启中...')
          ].join('\n'))
        }
        process.send?.("RESTART")
      }, 1000);
    }
    
    // 添加文件的时候
    detection.on("all", (event, path) => {
      // 判断配置文件是否被修改
      if(event === "change" && path === api.configName){
        timing(true)
      }
      const isEjs = path.search(/\.ejs$/i) !== -1
      // 模版文件被add的时候
      if(event === "add" && isEjs){
        process.send?.("RESTART")
      }
      // 模版文件被删除的时候
      if(event === "unlink" && isEjs){
        process.send?.("RESTART")
      }
    })
  })
}