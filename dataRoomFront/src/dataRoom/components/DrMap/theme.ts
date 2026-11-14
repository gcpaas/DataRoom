import type { DrMapConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅切换背景与数据配色，保留文字、结构线及交互状态。 */
export const drMapThemeMapping = [
  ['view.skyColor', 'background.primary'],
  ['visualMap.colors', 'series.colors'],
  ['marker.color', 'color.primary'],
  ['marker.ripple.color', 'color.primary'],
  ['flowLine.color', 'color.primary'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrMapConfig['props']>
