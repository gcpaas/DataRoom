/*
 * @description: 批量导入所有组件的配置config
 * @Date: 2023-03-13 10:04:58
 * @Author: xing.heng
 * @LastEditors: xing.heng
 * @LastEditTime: 2023-05-18 10:39:42
 */
const setModules = {} // 设置模块
const dataModules = {} // 数据模块
function importComponentSettingConfig (files) {
  files.keys().filter(key => {
    return key.match(/settingConfig/)
  }
  ).forEach(key => {
    const reg = new RegExp('(.\\/)(.*)(\\/)')
    let moduleName = key.match(reg)[0].replace(/(\.\/)|(\/)/g, '')
    moduleName = moduleName.replace(moduleName[0], moduleName[0].toLowerCase())
    setModules[moduleName] = files(key).settingConfig
    dataModules[moduleName] = files(key).dataConfig
  })
}
importComponentSettingConfig(require.context('packages/BasicComponents', true, /\.js$/))
importComponentSettingConfig(require.context('packages/Borders', true, /\.js$/))
importComponentSettingConfig(require.context('packages/Decorations', true, /\.js$/))
export { setModules, dataModules }
