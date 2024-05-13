const files = require.context('./', true, /[\u4e00-\u9fa5]+.js$/)
const echartSettings = []
// 获取plot配置
files.keys().forEach((key) => {
  const config = files(key).default
  echartSettings.push({
    setting: config.setting,
    name: config.name
  })
})
export default echartSettings
