import type { DrDataTableConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drDataTableThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
  ['global.borderColor', 'border.primary'],
  ['headerStyle.backgroundColor', 'background.secondary'],
  ['headerStyle.color', 'text.primary'],
  ['rowStyle.backgroundColor', 'background.secondary'],
  ['rowStyle.oddBackgroundColor', 'background.secondary'],
  ['rowStyle.evenBackgroundColor', 'background.secondary'],
  ['rowStyle.hoverBackgroundColor', 'background.primary'],
  ['rowStyle.borderColor', 'border.secondary'],
  ['cellStyle.color', 'text.primary']
] as const satisfies ThemeMapping<DrDataTableConfig['props']>
