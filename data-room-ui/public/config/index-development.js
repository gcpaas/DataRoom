window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://192.168.212.36:8083/dataRoomServer',
  fileUrlPrefix: 'http://192.168.212.36:8083/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
