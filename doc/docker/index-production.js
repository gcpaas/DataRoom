window.ENV = 'production'
var productionConfig = {
  baseUrl: getIpPort(),
  fileUrlPrefix: getIpPort() + '/dataroom',
}
// 必须的
window.SITE_CONFIG.dataRoom  = configDeepMerge(window.SITE_CONFIG.dataRoom , developmentConfig)


function getIpPort() {
  // 从当前网址中获取ip和端口
  const ipPort = window.location.host;
  return "http://" + ipPort
}
