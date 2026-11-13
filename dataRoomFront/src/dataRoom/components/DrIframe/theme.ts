import type { DrIframeConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drIframeThemeMapping = [
  ['style.backgroundColor', 'background.secondary'],
  ['style.border.color', 'border.primary']
] as const satisfies ThemeMapping<DrIframeConfig['props']>
