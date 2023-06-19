/*
 * @description: 案例和打包加载不同配置
 * @Author: xing.heng
 */

const isExample = process.env.VUE_APP_BUILD_TYPE === 'example'

module.exports = isExample
  ? require('./vue.config.example')
  : require('./vue.config.package')
