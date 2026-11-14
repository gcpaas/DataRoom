import type { DrTextConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 仅切换背景与数据配色，保留文字、结构线及交互状态。 */
export const drTextThemeMapping = [
  ['background.color', 'background.secondary'],
] as const satisfies ThemeMapping<DrTextConfig['props']>
