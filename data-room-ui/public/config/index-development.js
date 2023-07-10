window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://127.0.0.1:8081/bigScreenServer'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
