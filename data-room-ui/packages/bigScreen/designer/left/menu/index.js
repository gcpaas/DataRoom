// 左侧列表json
import componentsMenu from '../../../components/menuInstall.js'
export default [
  {
    name: 'coverage',
    title: '图层',
    icon: 'el-icon-document-copy',
    children: []
  },
  {
    name: 'component',
    title: '组件库',
    icon: 'el-icon-postcard',
    children: [...componentsMenu]
  },
  {
    name: 'resource',
    title: '素材库',
    icon: 'el-icon-collection',
    children: []
  },
  {
    name: 'globalVariable',
    title: '全局变量',
    icon: 'el-icon-tickets',
    children: []
  }
  // {
  //   name: 'history',
  //   title: '历史记录',
  //   icon: 'el-icon-alarm-clock',
  //   children: []
  // }
]
