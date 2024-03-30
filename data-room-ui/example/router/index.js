/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2024-01-30 14:36:24
 * @LastEditors: liu.shiyi
 * @LastEditTime: 2024-02-27 16:39:01
 */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const baseRoutes = []

export const constantRoutes = []

const createRouter = () => new Router({
  mode: process.env.VUE_APP_HISTORY === 'y' ? 'history' : null,
  base: process.env.VUE_APP_HISTORY === 'y' ? process.env.VUE_APP_BASE : null,
  scrollBehavior: () => ({ y: 0 }),
  routes: baseRoutes
})

const router = createRouter()

export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
