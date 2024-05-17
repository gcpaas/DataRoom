import 'babel-polyfill'
import promise from 'es6-promise'

import Vue from 'vue'
import ElementUI from 'element-ui'

import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
// import '@gcpaas/data-room-ui/packages/assets/style/common.scss'
import * as $dataRoomAxios from '@gcpaas/data-room-ui/packages/js/utils/http.js'
import { registerDataRoomUI } from '@gcpaas/data-room-ui/packages/index.js'
// import customPlots from '@/customPlots/exports'
Vue.use(ElementUI, { size: 'mini' })
registerDataRoomUI(
  router,
  {
    // 控制自定义路由是否加入到大屏的路由中，方便做权限控制
    registerRouter: true,
    httpConfigs: {
      baseURL: window.CONFIG?.baseUrl,
      headers: { 'Dataroom-Token': 'eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIyIiwiYXVkIjoiMiIsInVuYW1lIjoiYWRtaW4iLCJybmFtZSI6IueuoeeQhuWRmCIsImlzcyI6ImdjIiwib2lkIjoiMSIsImlkIjoiYWRtaW46cGNfMTc0NTYzODc5Njg4OTc5MjUxMyIsImV4cCI6MTcwNTExNDA5NiwiaWF0IjoxNzA1MDI3Njk2LCJ0aWQiOiIyIiwianRpIjoiYWRtaW46cGNfMTc0NTYzODc5Njg4OTc5MjUxMyJ9.3aOT1x4M-ngHNfcSnyoMgP3MGTenDhQwyCO_3nUqoRU' },
      // 现在文件路径保存的是相对路径，所以需要加上前缀,这个值一般和后端的gc.starter.file.urlPrefix一致
      fileUrlPrefix: window.CONFIG.fileUrlPrefix ? window.CONFIG.fileUrlPrefix : window.CONFIG?.baseUrl + '/static'
    }
  }
)
promise.polyfill()
// 自定义指令
Vue.use(ElementUI, { size: 'mini' })
Vue.config.productionTip = false
Vue.prototype.$dataRoomAxios = $dataRoomAxios
// 兼容ie下双向绑定事件
Vue.prototype.inputChange = function (e) {
  return e.target.value
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: (h) => h(App)
})
