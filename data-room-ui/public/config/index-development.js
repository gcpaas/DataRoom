window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://gcpaas.gccloud.com/bigScreenServer'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
