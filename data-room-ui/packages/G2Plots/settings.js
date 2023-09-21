const files = require.context('./', true, /[\u4e00-\u9fa5]+.js$/)
const plotSettings = []
// 获取plot配置
  files.keys().forEach((key) => {
    // ./折线图/基础折线图.js
    // 取到 "基础折线图"
    const config = files(key).default
    plotSettings.push({
      setting: config.setting,
      name: config.name,
    })
  })
export default plotSettings


