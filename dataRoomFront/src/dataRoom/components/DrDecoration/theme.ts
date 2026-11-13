import type { DrDecorationConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drDecorationThemeMapping = [
  ['colors', 'series.colors']
] as const satisfies ThemeMapping<DrDecorationConfig['props']>
