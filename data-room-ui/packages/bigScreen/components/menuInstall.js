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
import StackBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/StackBar/declaration.js'
import RoundBarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/RoundBar/declaration.js'
import StackColumnDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/StackColumn/declaration.js'
import GroupColumnDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/GroupColumn/declaration.js'
import MultiLineDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/MultiLine/declaration.js'
import RaceLineDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/RaceLine/declaration.js'
import QuarterPieDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/QuarterPie/declaration.js'
import InteractivePieDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/InteractivePie/declaration.js'
import BaseDonutDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseDonut/declaration.js'
import CardDonutDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/CardDonut/declaration.js'
import BaseRoseDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRose/declaration.js'
import StackAreaDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/StackArea/declaration.js'
import PercentAreaDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/PercentArea/declaration.js'
import BaseYuJueDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseYuJue/declaration.js'
import StackYuJueDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/StackYuJue/declaration.js'
import GroupRadarDesc from '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRadar/declaration.js'

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
        }, {
          ...StackBarDesc
        }, {
          ...RoundBarDesc
        }]
      },
      {
        code: 'column',
        name: '条形图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseColumnDesc
        }, { ...SingleColorColumnDesc }, { ...StackColumnDesc }, { ...GroupColumnDesc }]
      },
      {
        code: 'zhexiantu',
        name: '折线图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseLineDesc
        }, {
          ...MultiLineDesc
        }, {
          ...RaceLineDesc
        }]
      },
      {
        code: 'area',
        name: '区域图',
        icon: 'el-icon-s-data',
        children: [{
          ...BaseAreaDesc
        }, {
          ...StackAreaDesc
        }, {
          ...PercentAreaDesc
        }]
      },
      {
        code: 'pie',
        name: '饼环图',
        icon: 'el-icon-s-data',
        children: [{
          ...BasePieDesc
        }, {
          ...QuarterPieDesc
        }, {
          ...InteractivePieDesc
        }, {
          ...BaseDonutDesc
        }, {
          ...CardDonutDesc
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
        }, {
          ...GroupRadarDesc
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
        }, {
          ...BaseRoseDesc
        }, {
          ...BaseYuJueDesc
        }, {
          ...StackYuJueDesc
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
    children: [{ ...ButtonsDesc }, { ...InputsDesc }]
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
