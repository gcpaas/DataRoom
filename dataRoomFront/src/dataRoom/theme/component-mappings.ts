import { drPictorialBarChartThemeMapping } from '../components/DrPictorialBarChart/theme'
import { drFunnelChartThemeMapping } from '../components/DrFunnelChart/theme'
import { DrRichTextThemeMapping } from '../components/DrRichText/theme'
import { DrEchartsThemeMapping } from '../components/DrEcharts/theme'
import { DrHtmlThemeMapping } from '../components/DrHtml/theme'
import { drAlarmImageThemeMapping } from '../components/DrAlarmImage/theme'
import { drAreaChartThemeMapping } from '../components/DrAreaChart/theme'
import { barThemeMapping } from '../components/DrBarChart/theme'
import { drBorderThemeMapping } from '../components/DrBorder/theme'
import { drBubbleChartThemeMapping } from '../components/DrBubbleChart/theme'
import { drDataTableThemeMapping } from '../components/DrDataTable/theme'
import { drDateTimeThemeMapping } from '../components/DrDateTime/theme'
import { drDecorationThemeMapping } from '../components/DrDecoration/theme'
import { drFullScreenThemeMapping } from '../components/DrFullScreen/theme'
import { drGaugeThemeMapping } from '../components/DrGauge/theme'
import { drHorizontalBarChartThemeMapping } from '../components/DrHorizontalBarChart/theme'
import { drIframeThemeMapping } from '../components/DrIframe/theme'
import { drImageMetricCardThemeMapping } from '../components/DrImageMetricCard/theme'
import { drInputThemeMapping } from '../components/DrInput/theme'
import { drLineChartThemeMapping } from '../components/DrLineChart/theme'
import { drMapThemeMapping } from '../components/DrMap/theme'
import { drMetricCardThemeMapping } from '../components/DrMetricCard/theme'
import { drModel3DThemeMapping } from '../components/DrModel3D/theme'
import { drPieChartThemeMapping } from '../components/DrPieChart/theme'
import { drProgressBarThemeMapping } from '../components/DrProgressBar/theme'
import { drRadarChartThemeMapping } from '../components/DrRadarChart/theme'
import { drRadioThemeMapping } from '../components/DrRadio/theme'
import { drSelectThemeMapping } from '../components/DrSelect/theme'
import { drTabListThemeMapping } from '../components/DrTabList/theme'
import { drTextThemeMapping } from '../components/DrText/theme'
import { drVideoPlayerThemeMapping } from '../components/DrVideoPlayer/theme'
import { drWordCloudThemeMapping } from '../components/DrWordCloud/theme'
import type { ThemeStylePath } from './types'

export const componentThemeMappings: Readonly<Record<string, readonly (readonly [string, ThemeStylePath])[]>> = {
  DrRichText: DrRichTextThemeMapping,
  DrEcharts: DrEchartsThemeMapping,
  DrHtml: DrHtmlThemeMapping,
  DrAlarmImage: drAlarmImageThemeMapping,
  DrAreaChart: drAreaChartThemeMapping,
  DrBarChart: barThemeMapping,
  DrPictorialBarChart: drPictorialBarChartThemeMapping,
  DrBorder: drBorderThemeMapping,
  DrBubbleChart: drBubbleChartThemeMapping,
  DrDataTable: drDataTableThemeMapping,
  DrDateTime: drDateTimeThemeMapping,
  DrDecoration: drDecorationThemeMapping,
  DrFullScreen: drFullScreenThemeMapping,
  DrGauge: drGaugeThemeMapping,
  DrHorizontalBarChart: drHorizontalBarChartThemeMapping,
  DrIframe: drIframeThemeMapping,
  DrImageMetricCard: drImageMetricCardThemeMapping,
  DrInput: drInputThemeMapping,
  DrLineChart: drLineChartThemeMapping,
  DrMap: drMapThemeMapping,
  DrMetricCard: drMetricCardThemeMapping,
  DrModel3D: drModel3DThemeMapping,
  DrFunnelChart: drFunnelChartThemeMapping,
  DrPieChart: drPieChartThemeMapping,
  DrProgressBar: drProgressBarThemeMapping,
  DrRadarChart: drRadarChartThemeMapping,
  DrRadio: drRadioThemeMapping,
  DrSelect: drSelectThemeMapping,
  DrTabList: drTabListThemeMapping,
  DrText: drTextThemeMapping,
  DrVideoPlayer: drVideoPlayerThemeMapping,
  DrWordCloud: drWordCloudThemeMapping,
}

/** 无独立样式字段的组件仍显式登记，新增组件必须评估主题覆盖。 */
export const contentOnlyComponents = {
  'DrImage': '图片素材不包含可配置颜色',
  'DrGroup': '组合自身无颜色属性，递归应用子组件'
} as const
