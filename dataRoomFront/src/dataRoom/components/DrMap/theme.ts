import type { DrMapConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drMapThemeMapping = [
  ['view.skyColor', 'background.primary'],
  ['regionStyle.borderColor', 'border.primary'],
  ['regionStyle.shadowColor', 'color.primary'],
  ['regionLabel.color', 'text.primary'],
  ['emphasis.areaColor', 'color.primary'],
  ['emphasis.shadowColor', 'color.primary'],
  ['emphasis.label.color', 'text.primary'],
  ['visualMap.colors', 'series.colors'],
  ['visualMap.textStyle.color', 'text.primary'],
  ['marker.color', 'color.primary'],
  ['marker.borderColor', 'border.primary'],
  ['marker.ripple.color', 'color.primary'],
  ['marker.label.color', 'text.secondary'],
  ['flowLine.color', 'color.primary'],
  ['tooltip.backgroundColor', 'background.secondary'],
  ['tooltip.borderColor', 'border.primary'],
  ['tooltip.textStyle.color', 'text.primary'],
  ['backControl.color', 'text.primary']
] as const satisfies ThemeMapping<DrMapConfig['props']>
