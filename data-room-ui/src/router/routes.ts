import type { RouteRecordRaw } from 'vue-router'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/dataRoom/page/index',
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
    children: [
      {
        path: 'page/index',
        name: 'page',
        component: () => import('@/dataroom-packages/page/index.vue'),
      },
      {
        path: 'resource/index',
        name: 'resource',
        component: () => import('@/dataroom-packages/resource/index.vue'),
      },
      {
        path: 'dataSource/index',
        name: 'dataSource',
        component: () => import('@/dataroom-packages/dataSource/index.vue'),
      },
      {
        path: 'dataset/index',
        name: 'dataset',
        component: () => import('@/dataroom-packages/dataset/index.vue'),
      },
      {
        path: 'map/index',
        name: 'map',
        component: () => import('@/dataroom-packages/map/index.vue'),
      },
      {
        path: 'console',
        name: 'console',
        component: () => import('@/dataroom-packages/console/ConsoleLayout.vue'),
        redirect: '/dataRoom/console/user',
        children: [
          {
            path: 'user',
            name: 'consoleUser',
            component: () => import('@/dataroom-packages/user/index.vue'),
          },
          {
            path: 'profile',
            name: 'consoleProfile',
            component: () => import('@/dataroom-packages/profile/index.vue'),
          },
          {
            path: 'log',
            name: 'consoleAccessLog',
            component: () => import('@/dataroom-packages/operationLog/index.vue'),
          },
          {
            path: 'access-log',
            redirect: '/dataRoom/console/log',
          },
        ],
      },
      {
        path: 'profile',
        redirect: '/dataRoom/console/profile',
      },
      {
        path: 'user',
        redirect: '/dataRoom/console/user',
      },
    ],
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
]
