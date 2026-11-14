import type { DrHtmlConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

export const DrHtmlThemeMapping = [
  ['themeStyle.background', 'background.secondary'],
] as const satisfies ThemeMapping<DrHtmlConfig['props']>
