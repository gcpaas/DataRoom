import 'packages/assets/style/common/index.scss'
import 'packages/assets/style/bsTheme.scss'
// 大屏管理页面
import BigScreenManagement from 'packages/BigScreenMag'
// 渲染整个bigScreen的渲染引擎
import BigScreenRun from 'packages/BigScreenRun'
// 大屏设计引擎
import BigScreenDesign from 'packages/BigScreenDesign'
// 数据源管理
import DataSourceManagement from 'packages/DataSourceManagement'
// 数据集管理
import DataSetManagement from 'packages/DataSetManagement'
// 大屏管理-数据集管理的顶部路由框架
// import BigScreenTopLayout from 'packages/Layout'

// 大屏 vuex store数据
import bigScreenStore from 'packages/js/store'
// 注册基础配置
import registerConfig from 'packages/js/utils/registerConfig'
// 更新主题
import updateTheme from 'packages/js/utils/updateTheme'

// 存储组件列表
const components = [
  BigScreenManagement,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement
  // BigScreenTopLayout
]

const $bigScreen = {
  bigScreenStore
}

function install (Vue) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}

export {
  install,
  BigScreenManagement,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement,
  // BigScreenTopLayout,

  $bigScreen,
  registerConfig,
  updateTheme
}

export default {
  install,
  BigScreenManagement,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement,

  $bigScreen,
  registerConfig,
  updateTheme
}
