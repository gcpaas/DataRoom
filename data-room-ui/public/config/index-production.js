window.ENV = 'production'
var productionConfig = {
  baseURL: 'http://127.0.0.1:8083/dataRoomServer',
  fileUrlPrefix: 'http://127.0.0.1:8083/dataRoomServer' + '/static'
}
// 必须的
window.SITE_CONFIG.dataRoom  = configDeepMerge({} , productionConfig)
