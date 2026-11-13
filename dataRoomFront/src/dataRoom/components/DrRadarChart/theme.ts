import type { DrRadarChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drRadarChartThemeMapping = [
  ['radar.axisLine.color', 'border.primary'],
  ['radar.splitLine.color', 'border.secondary'],
  ['radar.axisLabel.color', 'text.secondary'],
  ['indicator.nameStyle.color', 'text.secondary'],
  ['legend.textStyle.color', 'text.secondary'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['series.colors', 'series.colors'],
  ['series.label.color', 'text.primary'],
  ['series.areaStyle.opacity', 'series.gradient.startOpacity']
] as const satisfies ThemeMapping<DrRadarChartConfig['props']>
