import type { DrTextConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drTextThemeMapping = [
  ['textStyle.color', 'text.primary'],
  ['background.color', 'text.primary'],
  ['background.border.color', 'border.primary']
] as const satisfies ThemeMapping<DrTextConfig['props']>
