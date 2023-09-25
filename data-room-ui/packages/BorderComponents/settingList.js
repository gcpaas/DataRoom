const files = require.context('../BorderComponents/', true, /setting.js$/)
const plotList = []
// 获取plot配置
  files.keys().forEach((key) => {
    // ./折线图/基础折线图.js
    // 取到 "基础折线图"
    const config = files(key).default
      plotList.push({
        type: config.type,
        setting: config.setting,
        name: config.name,
        isTitle: config.isTitle,
        padding: config.padding
      })
  })
export default plotList


