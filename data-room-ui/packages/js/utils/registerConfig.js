/**
 * 对象属性合并，与 Object.assign 语法不同
 * @param target
 * @param source
 * @returns {{}}
 */
function configDeepMerge (target, source) {
  const merged = {}
  for (const each in source) {
    if (target.hasOwnProperty(each) && source.hasOwnProperty(each)) {
      if (
        typeof target[each] === 'object' &&
          typeof source[each] === 'object'
      ) {
        merged[each] = configDeepMerge(target[each], source[each])
      } else {
        merged[each] = source[each]
      }
    } else if (source.hasOwnProperty(each)) {
      merged[each] = source[each]
    }
  }
  for (const eachTarget in target) {
    if (!(eachTarget in source) && target.hasOwnProperty(eachTarget)) {
      merged[eachTarget] = target[eachTarget]
    }
  }
  return merged
}
// 自动注册路由
function registerRouters (config, router) {
  // 没有router对象不注册路由
  if (!router) {
    return
  }
  const routers = [
    // 管理页面
    {
      path: config?.routers?.pageManagementUrl || '/',
      redirect: config?.routers?.pageListUrl || '/page-list',
      component: () => import('@gcpaas/data-room-ui/packages/common/manageLayout/index.vue'),
      children: [
        // 列表
        {
          path: config?.routers?.pageListUrl || '/page-list',
          name: 'PageList',
          component: () =>
            require.ensure([], () => require('@gcpaas/data-room-ui/packages/common/pageLayout/index.vue'))
        },
        // 数据源管理
        {
          path: config?.routers?.dataSourceManageUrl || '/big-screen/datasource',
          name: 'DataSourceManage',
          component: () =>
            require.ensure([], () => require('@gcpaas/data-room-ui/packages/datasource/index.vue'))
        },
        // 数据集管理
        {
          path: config?.routers?.dataSetManageUrl || '/big-screen/dataSet',
          name: 'DataSetManage',
          component: () =>
            require.ensure([], () => require('@gcpaas/data-room-ui/packages/dataSet/index.vue'))
        }
      ]
    },
    // 大屏设计
    {
      path: config?.routers?.bigScreenDesignUrl || '/big-screen/design',
      name: 'BigScreenDesign',
      component: () =>
        require.ensure([], () => require('@gcpaas/data-room-ui/packages/bigScreen/designer/index.vue'))
    },
    // 大屏运行
    {
      path: config?.routers?.bigScreenPreviewUrl || '/big-screen/preview',
      name: 'BigScreenPreview',
      component: () =>
        require.ensure([], () => require('@gcpaas/data-room-ui/packages/bigScreen/run/index.vue'))
    },
    // 仪表盘设计
    {
      path: config?.routers?.dashBoardDesignUrl || '/dash-bord/design',
      name: 'DashBoardDesign',
      component: () =>
        require.ensure([], () => require('@gcpaas/data-room-ui/packages/dashBoard/designer/index.vue'))
    },
    //  仪表盘运行
    {
      path: config?.routers?.dashBoardPreviewUrl || '/dash-bord/preview',
      name: 'DashBoardPreview',
      component: () =>
        require.ensure([], () => require('@gcpaas/data-room-ui/packages/dashBoard/run/index.vue'))
    }
  ]
  // 如果router有addRoutes方法
  if (!config.notRegisterRouter) {
    if (router?.addRoutes) {
      router?.addRoutes(routers)
    } else {
      // eslint-disable-next-line no-unused-expressions
      routers?.forEach((route) => {
        // eslint-disable-next-line no-unused-expressions
        router?.addRoute(route)
      })
    }
  }
}

// 注册配置
export default function (config, router) {
  window.BS_CONFIG = {}
  window.BS_CONFIG = configDeepMerge(window.BS_CONFIG, config)
  if (!config?.httpConfigs?.fileUrlPrefix) {
    // 如果没有配置文件访问前缀，使用baseURL加上/static作为文件前缀
    window.BS_CONFIG.httpConfigs.fileUrlPrefix = window.BS_CONFIG.httpConfigs.baseURL + '/static'
  }
  // 注册路由
  registerRouters(config, router)
}
