window.ENV = 'production'
var developmentConfig = {
  baseURL: 'http://gcpaas.gccloud.com/dataRoomServer',
  fileUrlPrefix: 'http://gcpaas.gccloud.com/dataRoomServer' + '/static'
}
// 必须的
window.SITE_CONFIG.dataRoom  = configDeepMerge(window.SITE_CONFIG.dataRoom , developmentConfig)
