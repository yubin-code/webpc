module.exports = function(source:string) {
  const newSource = `import 'lib-flexible'  // 引入适配包
${source}
  `
  return newSource
}