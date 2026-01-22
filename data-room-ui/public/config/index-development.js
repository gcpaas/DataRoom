window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://localhost:8081/dataRoomServer',
  fileUrlPrefix: 'http://localhost:8081/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge({}, developmentConfig)

