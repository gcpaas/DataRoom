import type { DrBarChartPropsInterface } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅声明主题负责的属性；切换不影响开关、尺寸、坐标与数据。 */
export const barThemeMapping = [
  ['xAxis.axisLine.color', 'border.primary'],
  ['xAxis.axisTick.color', 'border.secondary'],
  ['xAxis.axisLabel.color', 'text.secondary'],
  ['xAxis.splitLine.color', 'border.secondary'],
  ['yAxis.axisLine.color', 'border.primary'],
  ['yAxis.axisTick.color', 'border.secondary'],
  ['yAxis.axisLabel.color', 'text.secondary'],
  ['yAxis.splitLine.color', 'border.secondary'],
  ['legend.textStyle.color', 'text.secondary'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['series.colors', 'series.colors'],
  ['series.label.color', 'text.primary'],
  ['series.gradient.startOpacity', 'series.barGradient.startOpacity'],
  ['series.gradient.endOpacity', 'series.barGradient.endOpacity'],
] as const satisfies ThemeMapping<DrBarChartPropsInterface>
