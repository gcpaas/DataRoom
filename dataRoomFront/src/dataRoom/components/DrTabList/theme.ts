import type { DrTabListConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drTabListThemeMapping = [
  ['tabStyle.color', 'text.primary'],
  ['tabStyle.activeColor', 'color.primary'],
  ['tabStyle.backgroundColor', 'background.secondary'],
  ['tabStyle.activeBgColor', 'background.primary'],
  ['tabStyle.borderBottom.color', 'border.secondary'],
  ['indicator.color', 'color.primary']
] as const satisfies ThemeMapping<DrTabListConfig['props']>
