window.ENV = 'production'
var productionConfig = {
  baseURL: 'http://gcpaas.gccloud.com/bigScreenServer',
  fileUrlPrefix: 'http://gcpaas.gccloud.com/bigScreenServer' + '/static'
}
// 必须的
window.CONFIG = {}
window.CONFIG  = configDeepMerge(window.CONFIG , productionConfig)
