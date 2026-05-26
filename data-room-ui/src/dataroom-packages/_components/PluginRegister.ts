/**
 * 组件插件列表、需要手动导入、否则无法在组件库中显示
 */
import {DrTextPlugin} from '@/dataroom-packages/components/DrText/plugin.ts'
import {DrImagePlugin} from '@/dataroom-packages/components/DrImage/plugin.ts'
import {DrBarChartPlugin} from '@/dataroom-packages/components/DrBarChart/plugin.ts'
import {DrLineChartPlugin} from '@/dataroom-packages/components/DrLineChart/plugin.ts'
import {DrAreaChartPlugin} from '@/dataroom-packages/components/DrAreaChart/plugin.ts'
import {DrPieChartPlugin} from '@/dataroom-packages/components/DrPieChart/plugin.ts'
import {DrBubbleChartPlugin} from '@/dataroom-packages/components/DrBubbleChart/plugin.ts'
import {DrHorizontalBarChartPlugin} from '@/dataroom-packages/components/DrHorizontalBarChart/plugin.ts'
import {DrRadarChartPlugin} from '@/dataroom-packages/components/DrRadarChart/plugin.ts'
import {DrWordCloudPlugin} from '@/dataroom-packages/components/DrWordCloud/plugin.ts'
import {DrGaugePlugin} from '@/dataroom-packages/components/DrGauge/plugin.ts'
import {DrProgressBarPlugin} from '@/dataroom-packages/components/DrProgressBar/plugin.ts'
import {DrInputPlugin} from '@/dataroom-packages/components/DrInput/plugin.ts'
import {DrSelectPlugin} from '@/dataroom-packages/components/DrSelect/plugin.ts'
import {DrRadioPlugin} from '@/dataroom-packages/components/DrRadio/plugin.ts'
import {DrTabListPlugin} from '@/dataroom-packages/components/DrTabList/plugin.ts'
import {DrIframePlugin} from '@/dataroom-packages/components/DrIframe/plugin.ts'
import {DrVideoPlayerPlugin} from '@/dataroom-packages/components/DrVideoPlayer/plugin.ts'
import {DrFullScreenPlugin} from '@/dataroom-packages/components/DrFullScreen/plugin.ts'
import {DrMapPlugin} from '@/dataroom-packages/components/DrMap/plugin.ts'
import {DrBorderPlugin} from '@/dataroom-packages/components/DrBorder/plugin.ts'
import {DrDecorationPlugin} from '@/dataroom-packages/components/DrDecoration/plugin.ts'
import {DrMetricCardPlugin} from '@/dataroom-packages/components/DrMetricCard/plugin.ts'
import {DrTrendMetricCardPlugin} from '@/dataroom-packages/components/DrTrendMetricCard/plugin.ts'
import {DrPeriodCompareCardPlugin} from '@/dataroom-packages/components/DrPeriodCompareCard/plugin.ts'
import {DrDataTablePlugin} from '@/dataroom-packages/components/DrDataTable/plugin.ts'
import {DrDateTimePlugin} from '@/dataroom-packages/components/DrDateTime/plugin.ts'
import {DrHtmlPlugin} from '@/dataroom-packages/components/DrHtml/plugin.ts'
import {DrAnalysisTablePlugin} from '@/dataroom-packages/components/DrAnalysisTable/plugin.ts'
import type {ComponentLibTagInterface} from "@/dataroom-packages/PageDesigner/type/ComponentLibTagInterface.ts";
import {ComponentLibTagTypeConst} from "@/dataroom-packages/constant/ComponentLibTagTypeConst.ts";

const componentLibTagList: ComponentLibTagInterface[] = [
  {
    name: '折线图',
    tag: ComponentLibTagTypeConst.LINE
  },
  {
    name: '柱状图',
    tag: ComponentLibTagTypeConst.BAR
  },
  {
    name: '饼图',
    tag: ComponentLibTagTypeConst.PIE
  },
  {
    name: '散点图',
    tag: ComponentLibTagTypeConst.SCATTER
  },
  {
    name: '雷达图',
    tag: ComponentLibTagTypeConst.RADAR
  },
  {
    name: '漏斗图',
    tag: ComponentLibTagTypeConst.FUNNEL
  },
  {
    name: '仪表盘',
    tag: ComponentLibTagTypeConst.GAUGE
  },
  {
    name: '指标卡',
    tag: ComponentLibTagTypeConst.METRIC
  },
  {
    name: '表格',
    tag: ComponentLibTagTypeConst.TABLE
  },
  {
    name: '文本',
    tag: ComponentLibTagTypeConst.TEXT
  },
  {
    name: '地图',
    tag: ComponentLibTagTypeConst.MAP
  },
  {
    name: '多媒体',
    tag: ComponentLibTagTypeConst.MEDIA
  },
  {
    name: '装饰素材',
    tag: ComponentLibTagTypeConst.DECORATION
  },
  {
    name: '表单',
    tag: ComponentLibTagTypeConst.FORM
  }
]
/**
 * 组件列表
 */
const pluginList = [
  new DrTextPlugin([ComponentLibTagTypeConst.TEXT]),
  new DrDateTimePlugin([ComponentLibTagTypeConst.TEXT]),
  new DrImagePlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrBarChartPlugin([ComponentLibTagTypeConst.BAR]),
  new DrLineChartPlugin([ComponentLibTagTypeConst.LINE]),
  new DrAreaChartPlugin([ComponentLibTagTypeConst.LINE]),
  new DrPieChartPlugin([ComponentLibTagTypeConst.PIE]),
  new DrBubbleChartPlugin([ComponentLibTagTypeConst.SCATTER]),
  new DrHorizontalBarChartPlugin([ComponentLibTagTypeConst.BAR]),
  new DrRadarChartPlugin([ComponentLibTagTypeConst.RADAR]),
  new DrWordCloudPlugin([ComponentLibTagTypeConst.TEXT]),
  new DrGaugePlugin([ComponentLibTagTypeConst.GAUGE]),
  new DrProgressBarPlugin([ComponentLibTagTypeConst.GAUGE]),
  new DrMetricCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrTrendMetricCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrPeriodCompareCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrDataTablePlugin([ComponentLibTagTypeConst.TABLE]),
  new DrAnalysisTablePlugin([ComponentLibTagTypeConst.TABLE]),
  new DrInputPlugin([ComponentLibTagTypeConst.FORM]),
  new DrSelectPlugin([ComponentLibTagTypeConst.FORM]),
  new DrRadioPlugin([ComponentLibTagTypeConst.FORM]),
  new DrTabListPlugin([ComponentLibTagTypeConst.FORM]),
  new DrHtmlPlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrIframePlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrVideoPlayerPlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrBorderPlugin([ComponentLibTagTypeConst.DECORATION]),
  new DrDecorationPlugin([ComponentLibTagTypeConst.DECORATION]),
  new DrFullScreenPlugin([ComponentLibTagTypeConst.FORM]),
  new DrMapPlugin([ComponentLibTagTypeConst.MAP])
]

export { pluginList, componentLibTagList }
