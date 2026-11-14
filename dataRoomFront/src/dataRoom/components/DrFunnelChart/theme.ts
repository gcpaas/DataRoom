import type { DrFunnelChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const drFunnelChartThemeMapping = [
  ['series.colors', 'series.colors'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrFunnelChartConfig['props']>
