import type { DrTrendMetricCardConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drTrendMetricCardThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
  ['global.borderColor', 'border.primary'],
  ['title.color', 'text.primary'],
  ['value.color', 'text.primary'],
  ['timestamp.color', 'text.secondary'],
  ['compare.positiveColor', 'color.success'],
  ['compare.negativeColor', 'color.danger'],
  ['compare.neutralColor', 'text.disabled'],
  ['trend.lineColor', 'color.primary'],
  ['trend.areaColor', 'color.primary'],
  ['axis.labelColor', 'text.secondary'],
  ['trend.areaOpacity', 'series.gradient.startOpacity']
] as const satisfies ThemeMapping<DrTrendMetricCardConfig['props']>
