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
    component: () => import('@/dataRoom/login/Login.vue'),
  },
  {
    path: '/dataRoom',
    name: 'dataRoom',
    component: () => import('@/dataRoom/layout/UpDownLayout.vue'),
    children: [
      {
        path: 'page/index',
        name: 'page',
        component: () => import('@/dataRoom/page/index.vue'),
      },
      {
        path: 'resource/index',
        name: 'resource',
        component: () => import('@/dataRoom/resource/index.vue'),
      },
      {
        path: 'dataSource/index',
        name: 'dataSource',
        component: () => import('@/dataRoom/dataSource/index.vue'),
      },
      {
        path: 'dataset/index',
        name: 'dataset',
        component: () => import('@/dataRoom/dataset/index.vue'),
      },
      {
        path: 'map/index',
        name: 'map',
        component: () => import('@/dataRoom/map/index.vue'),
      },
      {
        path: 'console',
        name: 'console',
        component: () => import('@/dataRoom/console/ConsoleLayout.vue'),
        redirect: '/dataRoom/console/user',
        children: [
          {
            path: 'user',
            name: 'consoleUser',
            component: () => import('@/dataRoom/user/index.vue'),
          },
          {
            path: 'profile',
            name: 'consoleProfile',
            component: () => import('@/dataRoom/profile/index.vue'),
          },
          {
            path: 'log',
            name: 'consoleAccessLog',
            component: () => import('@/dataRoom/operationLog/index.vue'),
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
    component: () => import('@/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue'),
  },
  {
    path: '/dataRoom/visualScreenPreview/:pageStatus/:pageCode',
    name: 'visualScreenPreview',
    component: () => import('@/dataRoom/VisualScreenDesigner/preview/VisualScreenPreview.vue'),
  },
  {
    path: '/dataRoom/pageDesigner/:pageCode',
    name: 'pageDesigner',
    component: () => import('@/dataRoom/PageDesigner/PageDesigner.vue'),
  },
  {
    path: '/dataRoom/pagePreviewer/:pageStatus/:pageCode',
    name: 'pagePreviewer',
    component: () => import('@/dataRoom/PageDesigner/preview/PagePreviewer.vue'),
  },
]
