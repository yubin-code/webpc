import { join } from 'path'
// import Service from '@webpc/plug'
import Service from '../../../base/lib/index'
import { BaseOpts } from '@webpc/plug/types'

class HtmlService extends Service{
  constructor(opts: BaseOpts){
    super({
      ...opts,
      configName: ".webcof.js",
      presets: [
        // 预设
        require.resolve('./registerMethod'),
        require.resolve('../plugins/webpack'),
        require.resolve('../plugins/supervise'),

        // 指令
        require.resolve('../commands/build'),
        require.resolve('../commands/help'),
        require.resolve('../commands/init'),
      ]
    })
    // 获取根路径
    this.additive['root'] = join(__dirname, "../../");
  }
}

export default HtmlService