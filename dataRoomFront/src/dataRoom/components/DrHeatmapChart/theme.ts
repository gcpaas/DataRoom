import type { ThemeMapping } from '../../theme/types'
import type { DrHeatmapChartPropsInterface } from './install'

/** 切换配色，保留用户设置的数值范围与分段数、文字与结构线。 */
export const heatmapThemeMapping = [
  ['series.backgroundColor', 'color.primary'],
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrHeatmapChartPropsInterface>
