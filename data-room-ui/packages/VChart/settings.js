const files = require.context("./", true, /[\u4e00-\u9fa5]+.js$/);
const vchartSettings = [];
// 获取plot配置
files.keys().forEach((key) => {
  const config = files(key).default;
  vchartSettings.push({
    setting: config.setting,
    name: config.name,
  });
});
export default vchartSettings;
