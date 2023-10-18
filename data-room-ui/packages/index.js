
import 'data-room-ui/assets/style/common/index.scss'
import 'data-room-ui/assets/style/bsTheme.scss'

import $dataRoomStore from 'data-room-ui/js/store'
import registerConfig from 'data-room-ui/js/utils/registerConfig'
import updateTheme from 'data-room-ui/js/utils/updateTheme'
import * as $dataRoomAxios from 'data-room-ui/js/utils/http.js'

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
// 地图数据管理页面
const MapDataManagement = () => import('./MapDataManagement')

// 存储组件列表
const components = [
  BigScreenTopLayout,
  BigScreenManagement,
  BgiScreenSourceMag,
  BigScreenComponentMag,
  BigScreenRun,
  BigScreenDesign,
  DataSetManagement,
  DataSourceManagement,
  MapDataManagement
]

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
  MapDataManagement,
  $dataRoomStore,
  $dataRoomAxios,
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
  MapDataManagement,
  $dataRoomStore,
  $dataRoomAxios,
  registerConfig,
  updateTheme
}
