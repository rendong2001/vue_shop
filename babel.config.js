//这是项目发布阶段需要用到的babel插件【项目发布阶段取消控制台打印】
// const prodPlugins = []
// if (process.env.NODE_ENV === 'production') {
//   prodPlugins.push('transform-remove-console')
// }

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset']
  //发布产品时候的插件数组
  // ...prodPlugins
}
