import Chokidar from 'chokidar'
// 服务类型
export interface DetectionState {
  cwd: string;
  paths: string[];
}

/**
 * 用于监听文件的变化
 */
class Detection {
  chokidar: Chokidar.FSWatcher;
  constructor(opts:DetectionState){
    this.chokidar = Chokidar.watch(opts.paths, {
      ignoreInitial: true,
      cwd: opts.cwd,
      interval: 100,        // 间隔时间
    })
  }
  
  /**
   * 运行文件监控
   * @param paths 需要监控的文件
   * @param opts  回调钩子
   */
  on(type: string, onChange: (event:string, path:string) => void){
    this.chokidar.on(type, onChange)
  }
}

export default Detection