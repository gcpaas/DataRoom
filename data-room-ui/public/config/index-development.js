window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://127.0.0.1:8081/bigScreenServer',
  fileUrlPrefix: 'http://127.0.0.1:8081/bigScreenServer' + '/static'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
