// 左侧列表json
import componentsMenu from '../../../components/menuInstall.js'
export default [
  {
    code: 'coverage',
    name: '图层',
    icon: 'el-icon-document-copy',
    children: []
  },
  {
    code: 'component',
    name: '组件库',
    icon: 'el-icon-postcard',
    children: [...componentsMenu]
  },
  {
    code: 'resource',
    name: '素材库',
    icon: 'el-icon-collection',
    children: []
  },
  {
    code: 'interactions',
    name: '交互',
    icon: 'el-icon-collection',
    children: []
  },
  {
    code: 'modelComDialog',
    name: '弹窗下钻',
    icon: 'el-icon-collection',
    children: []
  },
  {
    code: 'globalVariable',
    name: '全局变量',
    icon: 'el-icon-tickets',
    children: []
  }
]
