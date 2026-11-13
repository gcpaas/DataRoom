import type { DrInputConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drInputThemeMapping = [
  ['style.color', 'text.primary'],
  ['style.placeholderColor', 'text.disabled'],
  ['style.backgroundColor', 'background.secondary'],
  ['style.borderColor', 'border.primary'],
  ['focus.borderColor', 'color.primary'],
  ['focus.shadowColor', 'color.primary']
] as const satisfies ThemeMapping<DrInputConfig['props']>
