// window.ENV = 'development'
// var developmentConfig = {
//   baseURL: 'http://gcpaas.gccloud.com/dataRoomServer',
//   fileUrlPrefix: 'http://gcpaas.gccloud.com/dataRoomServer' + '/static'
// }
// // 必须的
// window.SITE_CONFIG.dataRoom  = configDeepMerge(window.SITE_CONFIG.dataRoom , developmentConfig)

window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://127.0.0.1:8083/dataRoomServer',
  fileUrlPrefix: 'http://127.0.0.1:8083/dataRoomServer' + '/static'
}
window.SITE_CONFIG.dataRoom  = configDeepMerge(window.SITE_CONFIG.dataRoom , developmentConfig)
