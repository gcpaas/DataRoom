
import registerConfig from '@gcpaas/data-room-ui/packages/js/utils/registerConfig'
import * as $dataRoomAxios from '@gcpaas/data-room-ui/packages/js/utils/http.js'
// 大屏设计页面
const BigScreenDesign = () => import('./bigScreen/designer/index.js')
// 大屏预览页面
const BigScreenRun = () => import('./bigScreen/run/index.js')

// 仪表盘设计页面
const DashBoardDesign = () => import('./dashBoard/designer/index.js')
// 仪表盘预览页面
const DashBoardRun = () => import('./dashBoard/run/index.js')


// 存储组件列表
const components = [
  BigScreenDesign,
  BigScreenRun,
  DashBoardDesign,
  DashBoardRun
]

function install (Vue) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}

export {
  install,
  $dataRoomAxios,
  registerConfig,
  BigScreenDesign,
  BigScreenRun,
  DashBoardDesign,
  DashBoardRun
}

export default {
  install,
  $dataRoomAxios,
  registerConfig,
  BigScreenDesign,
  BigScreenRun,
  DashBoardDesign,
  DashBoardRun
}
