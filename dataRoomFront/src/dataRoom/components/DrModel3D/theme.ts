import type { DrModel3DConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drModel3DThemeMapping = [
  ['background.value', 'background.secondary'],
  ['material.color', 'color.primary'],
  ['lighting.point.color', 'color.primary']
] as const satisfies ThemeMapping<DrModel3DConfig['props']>
