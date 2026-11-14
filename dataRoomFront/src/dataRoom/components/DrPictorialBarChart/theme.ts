import type { DrPictorialBarChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'
export const drPictorialBarChartThemeMapping = [
  ['series.colors', 'series.colors'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrPictorialBarChartConfig['props']>
