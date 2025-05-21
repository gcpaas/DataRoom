window.ENV = 'development'
var developmentConfig = {
  baseURL: 'http://localhost:8081/bigScreenServer',
  fileUrlPrefix: 'http://localhost:8081/bigScreenServer' + '/static'
}
// 必须的
window.CONFIG={}
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)

