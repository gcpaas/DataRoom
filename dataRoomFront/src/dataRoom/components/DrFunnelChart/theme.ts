import type { DrFunnelChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const drFunnelChartThemeMapping = [
  ['series.colors', 'series.colors'],
] as const satisfies ThemeMapping<DrFunnelChartConfig['props']>
