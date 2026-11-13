import type { JSONContent } from '@tiptap/core'
import type { DrRichTextConfig } from '../components/DrRichText/install'
import type { DrMetricCardConfig } from '../components/DrMetricCard/install'
import type { ChartConfig } from '../components/type/ChartConfig'
import type { ChartTheme } from './types'
import type { DrGaugeConfig } from '../components/DrGauge/install'
import type { DrMapConfig } from '../components/DrMap/install'
import type { DrRadarChartConfig } from '../components/DrRadarChart/install'
import type { DrAreaChartConfig } from '../components/DrAreaChart/install'
import type { DrLineChartConfig } from '../components/DrLineChart/install'
import type { DrDataTableConfig } from '../components/DrDataTable/install'
import { withOpacity } from './color'

/** 非一对一颜色字段：保留分段位置、表格列属性等业务配置，只更新颜色。 */
export function applyComponentThemeDetails(chart: ChartConfig<unknown>, theme: ChartTheme, options: { preserveRichTextColors?: boolean } = {}) {
  switch (chart.type) {
    case 'DrRichText': {
      if (options.preserveRichTextColors) break
      const props = (chart as DrRichTextConfig).props
      const resetTextColors = (node: JSONContent) => {
        for (const mark of node.marks ?? []) {
          if (mark.type === 'textStyle' && mark.attrs) {
            delete mark.attrs.color
            delete mark.attrs.backgroundColor
          }
        }
        node.content?.forEach(resetTextColors)
      }
      resetTextColors(props.content)
      break
    }
    case 'DrMetricCard': {
      const props = (chart as DrMetricCardConfig).props
      for (const rule of props.conditional.rules) {
        rule.valueColor = theme.color.primary
        rule.backgroundColor = theme.background.secondary
        rule.borderColor = theme.border.primary
      }
      break
    }
    case 'DrGauge': {
      const props = (chart as DrGaugeConfig).props
      props.axisLine.colors = props.axisLine.colors.map(([position], index) => [
        position, theme.series.colors[index % theme.series.colors.length] ?? theme.color.primary,
      ])
      break
    }
    case 'DrMap': {
      const props = (chart as DrMapConfig).props
      props.regionStyle.areaGradient = [
        withOpacity(theme.color.primary, theme.series.gradient.startOpacity),
        withOpacity(theme.color.primary, theme.series.gradient.endOpacity),
      ]
      break
    }
    case 'DrRadarChart': {
      const props = (chart as DrRadarChartConfig).props
      props.radar.splitArea.colors = [withOpacity(theme.color.primary, 0.1), withOpacity(theme.color.primary, 0.05)]
      break
    }
    case 'DrAreaChart': {
      const props = (chart as DrAreaChartConfig).props
      // 渐变端点已经包含不透明度，整体不能再次相乘。
      props.series.areaStyle.opacity = props.series.areaStyle.gradient.enabled ? 1 : theme.series.gradient.startOpacity
      break
    }
    case 'DrLineChart': {
      const props = (chart as DrLineChartConfig).props
      props.series.symbol.borderColor = '' // 随各系列原色，保持描边清晰
      break
    }
    case 'DrDataTable': {
      const props = (chart as DrDataTableConfig).props
      for (const column of props.columnStyles ?? []) {
        // 只重置用户已配置的列颜色，保留字段、格式和宽度。
        if ('color' in column) column.color = theme.text.primary
        if ('headerColor' in column) column.headerColor = theme.text.primary
      }
      break
    }
  }
}
