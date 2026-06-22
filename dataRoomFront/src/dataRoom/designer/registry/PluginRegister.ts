/**
 * 组件插件列表、需要手动导入、否则无法在组件库中显示
 */
import {DrTextPlugin} from '@/dataRoom/components/DrText/plugin.ts'
import {DrImagePlugin} from '@/dataRoom/components/DrImage/plugin.ts'
import {DrBarChartPlugin} from '@/dataRoom/components/DrBarChart/plugin.ts'
import {DrLineChartPlugin} from '@/dataRoom/components/DrLineChart/plugin.ts'
import {DrAreaChartPlugin} from '@/dataRoom/components/DrAreaChart/plugin.ts'
import {DrPieChartPlugin} from '@/dataRoom/components/DrPieChart/plugin.ts'
import {DrBubbleChartPlugin} from '@/dataRoom/components/DrBubbleChart/plugin.ts'
import {DrHorizontalBarChartPlugin} from '@/dataRoom/components/DrHorizontalBarChart/plugin.ts'
import {DrRadarChartPlugin} from '@/dataRoom/components/DrRadarChart/plugin.ts'
import {DrWordCloudPlugin} from '@/dataRoom/components/DrWordCloud/plugin.ts'
import {DrGaugePlugin} from '@/dataRoom/components/DrGauge/plugin.ts'
import {DrProgressBarPlugin} from '@/dataRoom/components/DrProgressBar/plugin.ts'
import {DrInputPlugin} from '@/dataRoom/components/DrInput/plugin.ts'
import {DrSelectPlugin} from '@/dataRoom/components/DrSelect/plugin.ts'
import {DrRadioPlugin} from '@/dataRoom/components/DrRadio/plugin.ts'
import {DrTabListPlugin} from '@/dataRoom/components/DrTabList/plugin.ts'
import {DrIframePlugin} from '@/dataRoom/components/DrIframe/plugin.ts'
import {DrVideoPlayerPlugin} from '@/dataRoom/components/DrVideoPlayer/plugin.ts'
import {DrFullScreenPlugin} from '@/dataRoom/components/DrFullScreen/plugin.ts'
import {DrMapPlugin} from '@/dataRoom/components/DrMap/plugin.ts'
import {DrBorderPlugin} from '@/dataRoom/components/DrBorder/plugin.ts'
import {DrDecorationPlugin} from '@/dataRoom/components/DrDecoration/plugin.ts'
import {DrMetricCardPlugin} from '@/dataRoom/components/DrMetricCard/plugin.ts'
import {DrAlarmImagePlugin} from '@/dataRoom/components/DrAlarmImage/plugin.ts'
import {DrTrendMetricCardPlugin} from '@/dataRoom/components/DrTrendMetricCard/plugin.ts'
import {DrPeriodCompareCardPlugin} from '@/dataRoom/components/DrPeriodCompareCard/plugin.ts'
import {DrImageMetricCardPlugin} from '@/dataRoom/components/DrImageMetricCard/plugin.ts'
import {DrDataTablePlugin} from '@/dataRoom/components/DrDataTable/plugin.ts'
import {DrDateTimePlugin} from '@/dataRoom/components/DrDateTime/plugin.ts'
import {DrHtmlPlugin} from '@/dataRoom/components/DrHtml/plugin.ts'
import type {ComponentLibTagInterface} from "@/dataRoom/designer/types/ComponentLibTagInterface.ts";
import {ComponentLibTagTypeConst} from "@/dataRoom/constants/ComponentLibTagTypeConst.ts";

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
  new DrAlarmImagePlugin([ComponentLibTagTypeConst.METRIC]),
  new DrTrendMetricCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrPeriodCompareCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrImageMetricCardPlugin([ComponentLibTagTypeConst.METRIC]),
  new DrDataTablePlugin([ComponentLibTagTypeConst.TABLE]),
  new DrInputPlugin([ComponentLibTagTypeConst.FORM]),
  new DrSelectPlugin([ComponentLibTagTypeConst.FORM]),
  new DrRadioPlugin([ComponentLibTagTypeConst.FORM]),
  new DrTabListPlugin([ComponentLibTagTypeConst.FORM]),
  new DrIframePlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrHtmlPlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrVideoPlayerPlugin([ComponentLibTagTypeConst.MEDIA]),
  new DrBorderPlugin([ComponentLibTagTypeConst.DECORATION]),
  new DrDecorationPlugin([ComponentLibTagTypeConst.DECORATION]),
  new DrFullScreenPlugin([ComponentLibTagTypeConst.FORM]),
  new DrMapPlugin([ComponentLibTagTypeConst.MAP])
]

export { pluginList, componentLibTagList }
