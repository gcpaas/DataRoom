window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://127.0.0.1:8082/dataRoomServer',
  fileUrlPrefix: 'http://127.0.0.1:8082/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
