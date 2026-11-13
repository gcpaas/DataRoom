import type { DrGaugeConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drGaugeThemeMapping = [
  ['axisTick.color', 'border.secondary'],
  ['splitLine.color', 'border.secondary'],
  ['axisLabel.color', 'text.secondary'],
  ['pointer.color', 'color.primary'],
  ['anchor.color', 'color.primary'],
  ['anchor.borderColor', 'border.primary'],
  ['progress.color', 'color.primary'],
  ['detail.color', 'text.primary'],
  ['title.color', 'text.primary']
] as const satisfies ThemeMapping<DrGaugeConfig['props']>
