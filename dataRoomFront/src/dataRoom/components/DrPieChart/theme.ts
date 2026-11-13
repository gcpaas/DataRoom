import type { DrPieChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drPieChartThemeMapping = [
  ['pie.borderColor', 'border.primary'],
  ['centerContent.title.color', 'text.primary'],
  ['centerContent.value.color', 'text.primary'],
  ['label.color', 'text.primary'],
  ['label.guideLine.color', 'border.secondary'],
  ['legend.textStyle.color', 'text.secondary'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['series.roseColors', 'series.colors'],
  ['series.colors', 'series.colors']
] as const satisfies ThemeMapping<DrPieChartConfig['props']>
