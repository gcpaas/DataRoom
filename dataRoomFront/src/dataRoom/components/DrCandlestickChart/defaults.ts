import { DEFAULT_NEUTRAL_COLOR, createTooltipAppearance } from '../../theme/defaults'
import { getDefaultTheme } from '../../theme/registry'
import type { PageType } from '../../constants/PageType'
import type { DrCandlestickChartPropsInterface } from './install'

// 行情语义色独立于 Element Plus 界面状态色。
export const UP_COLOR = '#eb5454'
export const DOWN_COLOR = '#47b262'
export function createCandlestickProps(pageType: PageType): DrCandlestickChartPropsInterface {
  const tooltip = createTooltipAppearance(getDefaultTheme(pageType).color.primary)
  return {
    series: { upColor: UP_COLOR, downColor: DOWN_COLOR, upHollow: false, downHollow: false, barMaxWidth: 20 },
    xAxis: { show: true, labelShow: true, fontSize: 12, color: DEFAULT_NEUTRAL_COLOR },
    yAxis: { show: true, labelShow: true, fontSize: 12, color: DEFAULT_NEUTRAL_COLOR, splitLineShow: true, splitLineWidth: 1, splitLineColor: DEFAULT_NEUTRAL_COLOR, splitLineType: 'solid' },
    tooltip: { show: true, ...tooltip, textStyle: { ...tooltip.textStyle, fontSize: 12 } },
  }
}
