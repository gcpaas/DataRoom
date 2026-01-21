window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://127.0.0.1:8083/dataRoomServer',
  fileUrlPrefix: 'http://127.0.0.1:8083/dataRoomServer' + '/static'
}
window.SITE_CONFIG.dataRoom  = configDeepMerge({} , developmentConfig)
