import {createRouter, createWebHashHistory} from 'vue-router'
import config from '../../package.json'
import { appRoutes } from './routes'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: appRoutes,
})

console.log(
  '%cDataRoom-Plus%cv%s%c 请给我一个Star %s',
  `font-size:24px;color:#3478f6;vertical-align: bottom;background:#ecf2fd;padding:0 10px;border-radius:8px;`,
  `font-size:18px;color:#666;vertical-align: bottom;margin-left:12px;`,
  config.version,
  `font-size:18px;color:#999;vertical-align: bottom;margin-left:15px;text-decoration: none;`,
  `https://gitee.com/gcpaas/DataRoom/tree/refactor.vue3/`,
)
export default router
