window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://gcpaas.gccloud.com/bigScreenServer',
  fileUrlPrefix: 'http://gcpaas.gccloud.com/bigScreenServer' + '/static'
}
// 必须的
window.CONFIG={}
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)

