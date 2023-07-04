
// 大屏列表管理页面
import 'packages/assets/style/common/index.scss'
import 'packages/assets/style/bsTheme.scss'

// 大屏 vuex store数据
import bigScreenStore from 'packages/js/store'
// 注册基础配置
import registerConfig from 'packages/js/utils/registerConfig'
// 更新主题
import updateTheme from 'packages/js/utils/updateTheme'

// 布局组件
const BigScreenTopLayout = () => import('./Layout/ApplicationCreateTop/index.vue')
// 大屏列表管理页面
const BigScreenManagement = () => import('./BigScreenMag')
// 大屏资源管理页面
const BgiScreenSourceMag = () => import('./SourceMag')
// 大屏组件管理页面
const BigScreenComponentMag = () => import('./BigScreenComponentMag')
// 大屏预览页面
const BigScreenRun = () => import('./BigScreenRun')
// 大屏设计页面
const BigScreenDesign = () => import('./BigScreenDesign')
// 数据集管理页面
const DataSetManagement = () => import('./DataSetManagement')
// 数据源管理页面
const DataSourceManagement = () => import('./DataSourceManagement')

// 存储组件列表
const components = [
  BigScreenTopLayout,
  BigScreenManagement,
  BgiScreenSourceMag,
  BigScreenComponentMag,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement
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
  BigScreenTopLayout,
  BigScreenManagement,
  BgiScreenSourceMag,
  BigScreenComponentMag,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement,
  $bigScreen,
  registerConfig,
  updateTheme
}

export default {
  install,
  BigScreenTopLayout,
  BgiScreenSourceMag,
  BigScreenComponentMag,
  BigScreenManagement,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement,
  $bigScreen,
  registerConfig,
  updateTheme
}
