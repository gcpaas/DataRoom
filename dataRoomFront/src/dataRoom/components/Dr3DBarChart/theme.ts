import type { Dr3DBarChartPropsInterface } from './install'
import type { ThemeMapping } from '../../theme/types'

export const bar3DThemeMapping = [
  ['series.colors', 'series.colors'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<Dr3DBarChartPropsInterface>
