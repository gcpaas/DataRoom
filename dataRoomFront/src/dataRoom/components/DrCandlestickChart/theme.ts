import type { DrCandlestickChartConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 保留涨跌语义色和轴标签文字，提示框与其他图表同步主题边框。 */
export const drCandlestickChartThemeMapping = [
  ['tooltip.borderColor', 'color.primary'],
] as const satisfies ThemeMapping<DrCandlestickChartConfig['props']>
