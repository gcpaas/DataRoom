import type { DrRadioConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drRadioThemeMapping = [
  ['style.color', 'text.primary'],
  ['style.activeColor', 'color.primary'],
  ['style.activeBgColor', 'background.primary'],
  ['style.inactiveColor', 'text.disabled'],
  ['style.inactiveBgColor', 'background.primary']
] as const satisfies ThemeMapping<DrRadioConfig['props']>
