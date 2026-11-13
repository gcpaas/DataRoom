import type { DrPeriodCompareCardConfig } from './install'
import type { ThemeMapping } from '../../theme/types'

/** 主题仅重置颜色与填充参数，不改动布局、数据或交互。 */
export const drPeriodCompareCardThemeMapping = [
  ['global.backgroundColor', 'background.secondary'],
  ['global.borderColor', 'border.primary'],
  ['title.color', 'text.primary'],
  ['current.color', 'text.primary'],
  ['indicator.positiveColor', 'color.success'],
  ['indicator.negativeColor', 'color.danger'],
  ['indicator.neutralColor', 'text.disabled'],
  ['textStyle.labelColor', 'text.secondary']
] as const satisfies ThemeMapping<DrPeriodCompareCardConfig['props']>
