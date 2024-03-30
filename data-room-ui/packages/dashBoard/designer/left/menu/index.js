// 左侧列表json
import componentsMenu from '../../../components/menuInstall.js'
export default [
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
  }
]
