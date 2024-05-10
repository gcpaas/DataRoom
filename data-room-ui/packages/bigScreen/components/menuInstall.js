// 组件库左侧列表
import TextsDesc from '@gcpaas/data-room-ui/packages/components/texts/declaration.js'
import BaseLineDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/declaration.js'
import BaseBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/declaration.js'
import BaseColumnDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/declaration.js'
import GroupBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/declaration.js'
import ContainerDesc from '@gcpaas/data-room-ui/packages/components/container/declaration.js'
import PictureDesc from '@gcpaas/data-room-ui/packages/components/media/picture/declaration.js'
import BaseMap from '@gcpaas/data-room-ui/packages/components/map/BaseMap/declaration.js'
export default [
  {
    code: 'g2Plot',
    name: '图表',
    icon: 'el-icon-s-data',
    children: [
      {
        code: 'bar',
        name: '柱状图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseBarDesc
        }, {
          ...GroupBarDesc
        }]
      },
      {
        code: 'strip',
        name: '条形图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseColumnDesc
        }]
      },
      {
        code: 'zhexiantu',
        name: '折线图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'quyutu',
        name: '区域图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'binhuantu',
        name: '饼环图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'sandiantu',
        name: '散点图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'leidatu',
        name: '雷达图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'guanxitu',
        name: '关系图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      },
      {
        code: 'qita',
        name: '其他',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }]
      }
    ]
  },
  {
    code: 'ditu',
    name: '地图',
    icon: 'el-icon-tickets',
    children: [{ ...BaseMap }]
  },
  {
    code: 'info',
    name: '信息',
    icon: 'el-icon-tickets',
    children: [{ ...TextsDesc }]
  },
  {
    code: 'biaoge',
    name: '表格',
    icon: 'el-icon-tickets',
    children: []
  },
  {
    code: 'kongjian',
    name: '控件',
    icon: 'el-icon-s-data',
    children: []
  },
  {
    code: 'container',
    name: '容器',
    icon: 'el-icon-postcard',
    children: [{ ...ContainerDesc }]
  },
  {
    code: 'meiti',
    name: '媒体',
    icon: 'el-icon-tickets',
    children: [
      { ...PictureDesc }
    ]
  },
  {
    code: 'qita',
    name: '其他',
    icon: 'el-icon-tickets',
    children: []
  }
]
