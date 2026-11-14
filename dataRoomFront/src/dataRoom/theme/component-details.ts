import type { ChartConfig } from '../components/type/ChartConfig'
import type { ChartTheme } from './types'
import { withOpacity } from './color'
import { TOOLTIP_TEXT_COLOR, TOOLTIP_BACKGROUND_OPACITY, type TooltipAppearance } from './defaults'

/** 复杂字段只更新颜色，不重置标签、透明度、条件规则或富文本内容。 */
export function applyComponentThemeDetails(chart: ChartConfig<unknown>, theme: ChartTheme) {
  const props = chart.props as Record<string, unknown>
  const tooltip = props.tooltip as Partial<TooltipAppearance> | undefined
  if (tooltip && typeof tooltip.borderColor === 'string') {
    tooltip.backgroundColor = withOpacity(theme.color.primary, TOOLTIP_BACKGROUND_OPACITY)
    tooltip.textStyle = { ...tooltip.textStyle, color: TOOLTIP_TEXT_COLOR }
  }
  if (chart.type === 'DrMap') {
    const region = props.regionStyle as { areaGradient: string[] }
    region.areaGradient = region.areaGradient.map(color => {
      const rgba = color.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)$/i)
      const hexAlpha = /^#[\da-f]{8}$/i.test(color) ? parseInt(color.slice(-2), 16) / 255
        : /^#[\da-f]{4}$/i.test(color) ? parseInt(color.slice(-1).repeat(2), 16) / 255 : 1
      return withOpacity(theme.color.primary, rgba ? Number(rgba[1]) : hexAlpha)
    })
  }
  if (chart.type === 'DrDataTable') {
    const rows = props.rowStyle as { oddBackgroundColor: string; evenBackgroundColor: string }
    rows.evenBackgroundColor = withOpacity(theme.color.primary, 0.08)
  }
}
