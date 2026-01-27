import {createApp} from 'vue'
import {createPinia} from 'pinia'
import 'normalize.css'
import '@/dataroom-packages/assets/var.scss'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import {injectRouter} from '@/dataroom-packages/_common/_request.ts'
// 注入路由实例，便于进行路由跳转
injectRouter(router)


const app = createApp(App)
// 注册图表
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
