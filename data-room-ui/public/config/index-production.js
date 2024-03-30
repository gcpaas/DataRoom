window.ENV = 'production'
var productionConfig = {
  baseUrl: 'http://192.168.59.45:8082/dataRoomServer',
  fileUrlPrefix: 'http://192.168.59.45:8082/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, productionConfig)
