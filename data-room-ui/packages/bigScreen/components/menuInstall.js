// 组件库左侧列表
import TextsDesc from '@gcpaas/data-room-ui/packages/components/texts/declaration.js'
import BaseLineDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/declaration.js'
import BaseBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/declaration.js'
import BaseColumnDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/declaration.js'
import SingleColorColumnDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/SingleColorColumn/declaration.js'
import BaseAreaDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/declaration.js'
import BasePieDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/declaration.js'
import BaseRadarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/declaration.js'
import BasePointDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/declaration.js'
import BaseGridDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/declaration.js'
import GroupBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/declaration.js'
import ContainerDesc from '@gcpaas/data-room-ui/packages/components/container/declaration.js'
import PictureDesc from '@gcpaas/data-room-ui/packages/components/media/picture/declaration.js'
import BaseMapDesc from '@gcpaas/data-room-ui/packages/components/map/BaseMap/declaration.js'
import BaseTableDesc from '@gcpaas/data-room-ui/packages/components/tables/BaseTable/declaration.js'
import ButtonsDesc from '@gcpaas/data-room-ui/packages/components/controls/buttons/declaration.js'
import InputsDesc from '@gcpaas/data-room-ui/packages/components/controls/inputs/declaration.js'
import WordCloudDesc from '@gcpaas/data-room-ui/packages/components/rests/WordCloud/declaration.js'
import HeatmapDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/declaration.js'
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
        code: 'column',
        name: '条形图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseColumnDesc
        }, { ...SingleColorColumnDesc }]
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
        code: 'area',
        name: '区域图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseAreaDesc
        }]
      },
      {
        code: 'pie',
        name: '饼环图',
        icon: 'el-icon-s-data',
        children: [{
          ...BasePieDesc
        }]
      },
      {
        code: 'point',
        name: '散点图',
        icon: 'el-icon-s-data',
        children: [{
          ...BasePointDesc
        }]
      },
      {
        code: 'radar',
        name: '雷达图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseRadarDesc
        }]
      },
      {
        code: 'grid',
        name: '关系图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseGridDesc
        }]
      },
      {
        code: 'qita',
        name: '其他',
        icon: 'el-icon-s-data',
        children: [{
          ...HeatmapDesc
        }]
      }
    ]
  },
  {
    code: 'ditu',
    name: '地图',
    icon: 'el-icon-tickets',
    children: [{ ...BaseMapDesc }]
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
    children: [{ ...BaseTableDesc }]
  },
  {
    code: 'kongjian',
    name: '控件',
    icon: 'el-icon-s-data',
    children: [{ ...ButtonsDesc },{...InputsDesc}]
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
    children: [{ ...WordCloudDesc }]
  }
]
