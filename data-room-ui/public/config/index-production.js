window.ENV = 'production'
var productionConfig = {
  baseURL: 'http://localhost:8081/bigScreenServer',
  fileUrlPrefix: 'http://localhost:8081/bigScreenServer' + '/static'
}
// 必须的
window.CONFIG  = configDeepMerge({} , productionConfig)
