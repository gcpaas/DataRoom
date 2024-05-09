window.ENV = 'production'
var productionConfig = {
  baseUrl: 'http://gcpaas.gccloud.com/dataRoomServer',
  fileUrlPrefix: 'http://gcpaas.gccloud.com/dataRoomServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, productionConfig)
