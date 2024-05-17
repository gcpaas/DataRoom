import 'babel-polyfill'
import promise from 'es6-promise'

import Vue from 'vue'
import ElementUI from 'element-ui'

import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
// import '@gcpaas/data-room-ui/packages/assets/style/common.scss'

import { registerDataRoomUI } from '@gcpaas/data-room-ui/packages/index.js'
// import customPlots from '@/customPlots/exports'
Vue.use(ElementUI, { size: 'mini' })
registerDataRoomUI(
  {
    router: router,
    registerRouter: true
  }
)
promise.polyfill()
// 自定义指令
Vue.use(ElementUI, { size: 'mini' })
Vue.config.productionTip = false
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
