import type { DrPictorialBarChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'
export const drPictorialBarChartThemeMapping = [
  ['series.colors', 'series.colors'],
  ['xAxis.color', 'text.primary'],
  ['yAxis.color', 'text.secondary'],
  ['yAxis.lineColor', 'border.primary'],
  ['label.color', 'text.primary'],
] as const satisfies ThemeMapping<DrPictorialBarChartConfig['props']>
