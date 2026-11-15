import type { Dr3DPieChartPropsInterface } from './install'
import type { ThemeMapping } from '../../theme/types'
export const pie3DThemeMapping = [
  ['series.colors', 'series.colors'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<Dr3DPieChartPropsInterface>
