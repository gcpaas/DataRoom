import type { DrEchartsConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const DrEchartsThemeMapping = [
  ['themeStyle.primary', 'color.primary'],
  ['themeStyle.colors', 'series.colors'],
  ['themeStyle.background', 'background.secondary'],
] as const satisfies ThemeMapping<DrEchartsConfig['props']>
