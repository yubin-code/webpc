import { fork } from 'child_process';

interface IOpts {
  scriptPath: string;
}

export default function start({ scriptPath }: IOpts) {
  const child = fork(scriptPath, process.argv.slice(2));
  // 添加启动环境变量防止子进程重复输出地址信息
  process.env['WEBPC_STARTUP'] = "START"
  // 提供子进程重启方法
  child.on('message', (type: any) => {
    // 重启进程
    if (type === 'RESTART') {
      child.kill();
      start({ scriptPath });
    }

    // 杀死进程
    if(type === "KILL"){
      child.kill();
    }
  });
  return child;
}