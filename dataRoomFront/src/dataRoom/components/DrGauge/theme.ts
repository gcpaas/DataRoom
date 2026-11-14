import type { DrGaugeConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅切换背景与数据配色，保留文字、结构线及交互状态。 */
export const drGaugeThemeMapping = [
  ['pointer.color', 'color.primary'],
  ['anchor.color', 'color.primary'],
  ['progress.color', 'color.primary'],
] as const satisfies ThemeMapping<DrGaugeConfig['props']>
