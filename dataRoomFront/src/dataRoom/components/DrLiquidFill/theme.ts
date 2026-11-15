import type { DrLiquidFillConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const drLiquidFillThemeMapping = [
  ['liquid.color', 'color.primary'],
  ['outline.color', 'color.primary'],
] as const satisfies ThemeMapping<DrLiquidFillConfig['props']>
