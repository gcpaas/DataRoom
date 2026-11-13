import type { DrSelectConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drSelectThemeMapping = [
  ['style.color', 'text.primary'],
  ['style.placeholderColor', 'text.disabled'],
  ['style.backgroundColor', 'background.secondary'],
  ['style.borderColor', 'border.primary'],
  ['options.optionColor', 'text.primary'],
  ['dropdown.backgroundColor', 'background.secondary'],
  ['dropdown.borderColor', 'border.primary'],
  ['dropdown.hoverBgColor', 'background.primary'],
  ['dropdown.activeBgColor', 'background.primary'],
  ['dropdown.activeColor', 'color.primary']
] as const satisfies ThemeMapping<DrSelectConfig['props']>
