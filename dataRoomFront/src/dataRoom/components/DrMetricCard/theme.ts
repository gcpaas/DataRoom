import type { DrMetricCardConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drMetricCardThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
  ['global.borderColor', 'border.primary'],
  ['global.shadow.color', 'color.primary'],
  ['title.color', 'text.primary'],
  ['value.color', 'text.primary'],
  ['subtitle.color', 'text.secondary'],
  ['unit.color', 'text.secondary']
] as const satisfies ThemeMapping<DrMetricCardConfig['props']>
