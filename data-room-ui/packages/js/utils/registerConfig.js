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
    // 页面管理
    {
      path: config?.routers?.pageManagementUrl || '/management',
      redirect: config?.routers?.pageListUrl || '/big-screen-list',
      component: () => import('data-room-ui/Layout/BigScreenHomeLayout'),
      children: [
        {
          path: config?.routers?.pageListUrl || '/big-screen-list',
          name: 'BigScreenList',
          component: () =>
            require.ensure([], () => require('data-room-ui/BigScreenMag')),
          meta: {
            title: '大屏管理'
          }
        },
        {
          path: config?.routers?.templateListUrl || '/big-screen-template',
          name: 'BigScreenTemplate',
          component: () =>
            require.ensure([], () => require('data-room-ui/BigScreenTempMag')),
          meta: {
            title: '模版管理'
          }
        },
        {
          path: config?.routers?.dataSourceUrl || '/big-screen-dataSource',
          component: () => import('data-room-ui/DataSourceManagement'),
          meta: {
            title: '数据源管理'
          }
        },
        {
          path: config?.routers?.dataSetUrl || '/big-screen-dataSet',
          component: () => import('data-room-ui/DataSetManagement'),
          meta: {
            title: '数据集管理'
          }
        },
        {
          path: config?.routers?.mapData || '/big-screen-map-data',
          component: () => import('data-room-ui/MapDataManagement'),
          meta: {
            title: '地图数据管理'
          }
        },
        {
          path: config?.routers?.SourceUrl || '/big-screen-source',
          component: () => import('data-room-ui/SourceManagement'),
          meta: {
            title: '资源库'
          }
        },
        {
          path: config?.routers?.componentUrl || '/big-screen-components',
          component: () => import('data-room-ui/BigScreenComponentMag'),
          meta: {
            title: '资源管理'
          }
        }
      ]
    },
    {
      path: config?.routers?.designUrl || '/big-screen/design',
      name: 'BigScreenDesign',
      component: () =>
        require.ensure([], () => require('data-room-ui/BigScreenDesign'))
    },
    {
      path: config?.routers?.previewUrl || '/big-screen/preview',
      name: 'BigScreenPreview',
      component: () =>
        require.ensure([], () => require('data-room-ui/BigScreenRun'))
    },
    {
      path: '/dataRoom-redirect',
      name: 'Redirect',
      component: () => import('data-room-ui/Layout/Redirect/index.vue')
    },
    {
      path: config?.routers?.bizComponentDesignUrl || '/big-screen-biz-component-design',
      component: () => import('data-room-ui/BizComponent'),
      meta: {
        title: '业务组件'
      }
    },
    {
      path: config?.routers?.bizComponentPreviewUrl || '/big-screen-biz-component-preview',
      component: () => import('data-room-ui/BizComponent/Preview.vue'),
      meta: {
        title: '业务组件预览'
      }
    }
  ]
  // 如果router有addRoutes方法
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

// 注册配置
function registerTheme (config) {
  const defaultTheme = {
    '--bs-el-color-primary': '#409EFF', // elment-ui主题色，激活
    '--bs-background-1': '#151a26', // 整体背景色
    '--bs-background-2': '#232832', // 布局背景色
    '--bs-el-background-1': '#151A26', // 组件背景色，输入框...
    '--bs-el-background-2': '#35393F', // 组件背景色，按钮、分页、加载...
    '--bs-el-background-3': '#303640', // 组件背景色，表格头部、下拉框hover...
    '--bs-el-title': '#ffffff', // 标题字体颜色
    '--bs-el-text': '#ffffff', // 一般字体颜色
    '--bs-el-border': 'transparent', // 边框颜色
    '--bs-el-color-primary-active': '64, 158, 255'
  }
  const mergedTheme = { ...defaultTheme, ...config?.customTheme }
  const style = document.createElement('style')
  style.type = 'text/css'
  let themeStr = ''
  for (const key in mergedTheme) {
    themeStr += `${key}:${mergedTheme[key]};`
  }
  // 给body添加class bs-body-theme-wrap
  document.body.classList.add('bs-body-theme-wrap')
  style.innerHTML = `.bs-body-theme-wrap {${themeStr}}`
  document.getElementsByTagName('head')[0].appendChild(style)
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
  // 注册自定义主题
  registerTheme(config)
}
