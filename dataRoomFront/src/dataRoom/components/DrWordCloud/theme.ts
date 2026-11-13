import type { DrWordCloudConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drWordCloudThemeMapping = [
  ['wordStyle.colors', 'series.colors'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['emphasis.textStyle.shadowColor', 'color.primary']
] as const satisfies ThemeMapping<DrWordCloudConfig['props']>
