// 组件库左侧列表
import TextsDesc from '@gcpaas/data-room-ui/packages/components/texts/declaration.js'
import BaseLineDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/declaration.js'
import BaseBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/declaration.js'
import GroupBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/declaration.js'
import ContainerDesc from '@gcpaas/data-room-ui/packages/components/container/declaration.js'
import PictureDesc from '@gcpaas/data-room-ui/packages/components/media/picture/declaration.js'
export default [
  {
    name: 'g2Plot',
    title: '图表',
    icon: 'el-icon-s-data',
    children: [
      {
        name: 'all',
        title: '全部',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'bar',
        title: '柱状图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseBarDesc
        }, {
          ...GroupBarDesc
        }]
      },
      {
        name: 'column',
        title: '条形图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseBarDesc
        }, {
          ...GroupBarDesc
        }]
      },
      {
        name: 'zhexiantu',
        title: '折线图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'quyutu',
        title: '区域图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'binhuantu',
        title: '饼环图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'sandiantu',
        title: '散点图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'leidatu',
        title: '雷达图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'guanxitu',
        title: '关系图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        name: 'qita',
        title: '其他',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      }
    ]
  },
  {
    name: 'ditu',
    title: '地图',
    icon: 'el-icon-tickets',
    children: []
  },
  {
    name: 'info',
    title: '信息',
    icon: 'el-icon-tickets',
    children: [{ ...TextsDesc }]
  },
  {
    name: 'biaoge',
    title: '表格',
    icon: 'el-icon-tickets',
    children: []
  },
  {
    name: 'kongjian',
    title: '控件',
    icon: 'el-icon-s-data',
    children: []
  },
  {
    name: 'container',
    title: '容器',
    icon: 'el-icon-postcard',
    children: [{ ...ContainerDesc }]
  },
  {
    name: 'meiti',
    title: '媒体',
    icon: 'el-icon-tickets',
    children: [
      { ...PictureDesc }
    ]
  },
  {
    name: 'qita',
    title: '其他',
    icon: 'el-icon-tickets',
    children: []
  }
]
