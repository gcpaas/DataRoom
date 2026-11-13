import type { DrHorizontalBarChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drHorizontalBarChartThemeMapping = [
  ['xAxis.axisLine.color', 'border.primary'],
  ['xAxis.axisLabel.color', 'text.secondary'],
  ['xAxis.axisTick.color', 'border.secondary'],
  ['xAxis.splitLine.color', 'border.secondary'],
  ['yAxis.axisLine.color', 'border.primary'],
  ['yAxis.axisLabel.color', 'text.secondary'],
  ['yAxis.axisTick.color', 'border.secondary'],
  ['yAxis.splitLine.color', 'border.secondary'],
  ['legend.textStyle.color', 'text.secondary'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['series.colors', 'series.colors'],
  ['series.gradient.startOpacity', 'series.barGradient.startOpacity'],
  ['series.gradient.endOpacity', 'series.barGradient.endOpacity'],
  ['series.label.color', 'text.primary'],
  ['series.backgroundBar.color', 'text.primary']
] as const satisfies ThemeMapping<DrHorizontalBarChartConfig['props']>
