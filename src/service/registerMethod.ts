import { Api } from '@webpc/plug/types'

// 注册方法
export default function (api: Api) {
  [
    
  ].forEach((name) => {
    api.registerMethod({ name })
  })

}

