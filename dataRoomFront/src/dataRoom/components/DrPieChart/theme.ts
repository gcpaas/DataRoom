import type { DrPieChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅切换背景与数据配色，保留文字、结构线及交互状态。 */
export const drPieChartThemeMapping = [
  ['series.colors', 'series.colors'],
  ['series.roseColors', 'series.colors'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrPieChartConfig['props']>
