import type { DrAlarmImageConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drAlarmImageThemeMapping = [
  ['value.color', 'text.primary']
] as const satisfies ThemeMapping<DrAlarmImageConfig['props']>
