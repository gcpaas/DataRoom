import {createRouter, createWebHashHistory} from 'vue-router'
import config from '../../package.json'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dataRoom/page/index'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/dataroom-packages/login/Login.vue'),
    },
    {
      path: '/dataRoom',
      name: 'dataRoom',
      component: () => import('@/dataroom-packages/layout/UpDownLayout.vue'),
      children: [{
        path: 'page/index',
        name: 'page',
        component: () => import('@/dataroom-packages/page/index.vue'),
      }, {
        path: 'resource/index',
        name: 'resource',
        component: () => import('@/dataroom-packages/resource/index.vue'),
      }, {
        path: 'dataSource/index',
        name: 'dataSource',
        component: () => import('@/dataroom-packages/dataSource/index.vue'),
      }, {
        path: 'dataset/index',
        name: 'dataset',
        component: () => import('@/dataroom-packages/dataset/index.vue'),
      }]
    },
    {
      path: '/dataRoom/visualScreenDesigner/:pageCode',
      name: 'visualScreenDesigner',
      component: () => import('@/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue'),
    },
    {
      path: '/dataRoom/visualScreenPreview/:pageStatus/:pageCode',
      name: 'visualScreenPreview',
      component: () => import('@/dataroom-packages/VisualScreenDesigner/preview/VisualScreenPreview.vue'),
    },
    {
      path: '/dataRoom/pageDesigner/:pageCode',
      name: 'pageDesigner',
      component: () => import('@/dataroom-packages/PageDesigner/PageDesigner.vue'),
    },
    {
      path: '/dataRoom/pagePreviewer/:pageStatus/:pageCode',
      name: 'pagePreviewer',
      component: () => import('@/dataroom-packages/PageDesigner/preview/PagePreviewer.vue'),
    },
  ],
})

console.log(
  '%cDataRoom-Plus%cv%s%c 请给我一个Star %s',
  `font-size:24px;color:#3478f6;vertical-align: bottom;background:#ecf2fd;padding:0 10px;border-radius:8px;`,
  `font-size:18px;color:#666;vertical-align: bottom;margin-left:12px;`,
  config.version,
  `font-size:18px;color:#999;vertical-align: bottom;margin-left:15px;text-decoration: none;`,
  `https://gitee.com/gcpaas/DataRoom-Plus`
);
export default router
