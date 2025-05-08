import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const baseRoutes = [
  {
    path: '/login',
    component: () => import('data-room-ui/Login/index.vue')
  },
  {
    path: '/notPermission',
    component: () => import('data-room-ui/NotPermission/index.vue')
  }
]

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
