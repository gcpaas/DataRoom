import type { DrImageMetricCardConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drImageMetricCardThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
  ['global.borderColor', 'border.primary'],
  ['global.shadow.color', 'color.primary'],
  ['description.color', 'text.secondary'],
  ['value.color', 'text.primary'],
  ['value.glow.color', 'color.primary'],
  ['unit.color', 'text.secondary']
] as const satisfies ThemeMapping<DrImageMetricCardConfig['props']>
