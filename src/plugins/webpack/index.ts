import { Api } from '@webpc/plug/types'
import { setConfig } from './GetConfig'
import address from 'address';
import chalk from 'chalk';


export default (api: Api) => {
  // 不是开发环境下面的都不用运行了
  if(api.env !== "development"){
    return
  }
  
  /**
   * 设置配置
   * 主要这个需要跟 api.env 配合使用
   * 因为插件在初始化的时候都会被运行一次
   * build的 setConfig 也会被执行所以需要加上判断
   */
  setConfig(api)
  api.afterComplete((data:any) => {
    const devServer = api.userConfig?.webpack?.devServer || {}
    // 编译错误的时候
    if(data.stats.hasErrors()){
      console.log("[error]: Wrong code")
      return
    }
    
    // 第一次编译成功的时候
    // 判断环境变量的 STARTUP 让只输出一次下面信息
    if(process.env.WEBPC_STARTUP !== "START"){
      const lanIp = address.ip();
      const { host, port } = data
      
      // 这边到时候添加判断
      const protocol = devServer.https ? 'https' : 'http';
      const portID = port ? port : 8000
      const localUrl = `${protocol}://${host}:${portID}`;
      const lanUrl = `${protocol}://${lanIp}:${portID}`;
      console.log(
        [
          "",
          "           ▍ ★∴",
          "　s ．t ．▍▍a．..r．█▍ ☆ ★∵t ..../ ",
          "　　◥█▅▅██▅▅██▅▅▅▅▅███◤ ",
          " 　 ．◥███████████████◤",
          "～～～～◥█████████████◤～～～～准备起航",
          "～～～～～～～～～～～～～～～～～～～～～～～～",
          "",
          `  服务运行成功:`,
          `  - 地址:   ${chalk.green(localUrl)}`,
          lanUrl && `  - 内网地址: ${chalk.green(lanUrl)}`,
        ]
        .filter(Boolean)
        .join('\n')
      );
      process.env['WEBPC_STARTUP'] = "START"
    }
  })
}
