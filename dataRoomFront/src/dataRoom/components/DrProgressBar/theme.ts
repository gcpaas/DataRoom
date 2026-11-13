import type { DrProgressBarConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drProgressBarThemeMapping = [
  ['bar.fillColor', 'color.primary'],
  ['bar.backgroundColor', 'border.primary'],
  ['bar.gradient.startColor', 'color.primary'],
  ['bar.gradient.endColor', 'color.secondary'],
  ['label.color', 'text.primary'],
  ['track.backgroundColor', 'border.primary'],
  ['border.color', 'border.primary'],
  ['title.color', 'text.primary']
] as const satisfies ThemeMapping<DrProgressBarConfig['props']>
