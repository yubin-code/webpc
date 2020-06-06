import { Api } from '@webpc/plug/types'
import Debug from 'debug'
import { setConfig } from '../plugins/webpack/GetConfig'

const debug = Debug('web:build')
export default (api: Api) => {
  // 如果不是生产环境不运行
  if(api.env !== "production"){
    return
  }
  
  debug("开始打包")
  setConfig(api)
  api.buildComplete(() => {
    // 设置配置
    console.log([
      "=============",
      ` 🐤打包结束   `,
      "=============",
    ].join('\n'))
  })
}