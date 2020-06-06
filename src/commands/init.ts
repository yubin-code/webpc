import { readdirSync } from 'fs';
import Spinnies from 'spinnies';
import os from 'os';
import { join } from 'path';
import { copy, readJson, writeJson } from 'fs-extra';
import { delay } from '../utils'
import { Api } from '@webpc/plug/types';
import chalk from 'chalk';

interface InitType extends Api {
  root: string;
}


export default (api: InitType) => {
  api.onInit(() => {
    const userCwd = api.cwd    
    const arr = readdirSync(userCwd);
    if(arr.length !== 0){
      console.log([
        "",
        ` ${chalk.bgRed(" error ")} ${chalk.red("非空目录无法初始化")}`,
        "",
        ` ${chalk.bgRed(" error ")} 请新建一个新目录后在尝试`,
        "",
      ].join('\n'))
      return
    }

    const spinnies = new Spinnies()
    spinnies.add('init', { text: "init project" });

    const pkg = require(join(api.root, 'package.json'));

    // 设置用户的package.json
    readJson(join(api.root, '/template/package.json'), (err, data) =>{
      const isWindow = os.type() === "Windows_NT"
      /**
       * 获取用户目录名称
       * window路径是window路径是 \\ 而mac是/
       * 所以这里需要做下判断
       */
      const userFilelen = userCwd.lastIndexOf(isWindow ? '\\' : '/')
      let userFile = userCwd.substring(userFilelen+1)
      // 设置用户项目名称
      const userPackage = data
      /**
       * 如果是window 设置以下内容
       * 因为window不支持直接写环境变量不然会报错
       */
      if(isWindow){
        // userFile = "my-app"
        userPackage.scripts.dev = "webpc dev"
        userPackage.scripts.build = "webpc build"
      }

      userPackage.name = userFile
      userPackage.dependencies.webpc = pkg.version
      
      writeJson(join(userCwd, 'package.json'), userPackage, { spaces: '\t' }).then(async () => {
        await delay(500)
        spinnies.succeed('init', { text: "init success" });
        console.log(
          [
            " ",
            chalk.magenta("🔮start up project run"),
            chalk.magenta("yarn"),
            chalk.magenta("and"),
            chalk.magenta("webpk dev"),
            " "
          ]
          .filter(Boolean)
          .join('\n')
        )
      }).catch(err => {
        spinnies.error('init', { text: "init error" });
      })
    })
    copy(join(api.root, '/template/web'), userCwd)
      .catch(err => console.error(err))
  })
}