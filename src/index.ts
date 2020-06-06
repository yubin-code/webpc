import Service from './service'


(async () => {
  const service = new Service({
    cwd: process.cwd(),
  })
  
  service.run({ name: "dev" })
  
  // 管理退出进程
  let closed = false;
  function onSignal(signal: string) {
    if (closed) return; 
    closed = true;
    // 退出时触发插件中的onExit事件
    service.applyPlugins({
      key: 'onExit',
      type: service.ApplyPluginsType.event,
      args: {
        signal,
      },
    });
    process.exit(0);
  }

  // kill(2) Ctrl-C
  process.once('SIGINT', () => onSignal('SIGINT'));
  // kill(3) Ctrl-\
  process.once('SIGQUIT', () => onSignal('SIGQUIT'));
  // kill(15) default
  process.once('SIGTERM', () => onSignal('SIGTERM'));

})()