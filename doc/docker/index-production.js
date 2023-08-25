window.ENV = 'production'
var productionConfig = {
  baseUrl: getIpPort()
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, productionConfig)


function getIpPort() {
  // 从当前网址中获取ip和端口
  const ipPort = window.location.host;
  return "http://" + ipPort
}
