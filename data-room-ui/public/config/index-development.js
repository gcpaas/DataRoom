window.ENV = 'development'
var developmentConfig = {
  baseUrl: 'http://192.168.223.109:8081/bigScreenServer'
}
// 必须的
window.CONFIG = configDeepMerge(window.CONFIG, developmentConfig)
