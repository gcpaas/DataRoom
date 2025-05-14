import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import * as tokenCacheService from '@gcpaas/data-room-ui/packages/js/utils/tokenCacheService'

// 禁用进度条的旋转加载动画
NProgress.configure({ showSpinner: false })

const whiteList = ['/login','/notPermission']

router.beforeEach(async (to, from, next) => {
  const token = tokenCacheService.get()
  if (!token) {
    //  还没有登录过,如果是白名单路由，那么不登录也可以访问
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login`)
    }
    return
  }
  if (to.path === '/login' || to.path === '/') {
    next('/dashboard-list'); // 已登录用户跳转到主页（避免循环）
    return
  }
  next()
})

router.afterEach(() => {
  // 顶部进度条结束
  NProgress.done()
})
