import type { DrMetricCardConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅切换背景与数据配色，保留文字、结构线及交互状态。 */
export const drMetricCardThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
] as const satisfies ThemeMapping<DrMetricCardConfig['props']>
