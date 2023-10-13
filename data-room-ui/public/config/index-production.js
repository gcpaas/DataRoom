window.ENV = 'production'
var productionConfig = {
  baseUrl: 'http://gcpaas.gccloud.com/bigScreenServer',
  fileUrlPrefix: 'http://gcpaas.gccloud.com/bigScreenServer' + '/static'

}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, productionConfig)
