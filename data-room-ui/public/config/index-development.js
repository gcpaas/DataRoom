window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://127.0.0.1:8083/dataRoomServer',
  fileUrlPrefix: 'http://127.0.0.1:8083/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
