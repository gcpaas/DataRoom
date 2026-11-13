import type { DrEchartsConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const DrEchartsThemeMapping = [
  ['themeStyle.text', 'text.primary'],
  ['themeStyle.secondaryText', 'text.secondary'],
  ['themeStyle.background', 'background.secondary'],
  ['themeStyle.border', 'border.primary'],
  ['themeStyle.grid', 'border.secondary'],
  ['themeStyle.primary', 'color.primary'],
  ['themeStyle.colors', 'series.colors'],
] as const satisfies ThemeMapping<DrEchartsConfig['props']>
