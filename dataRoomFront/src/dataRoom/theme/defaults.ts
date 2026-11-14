import { withOpacity } from './color'

/** 组件默认中性色；主题切换不得覆盖用户已配置的文字与结构线。 */
export const DEFAULT_NEUTRAL_COLOR = '#A8ABB2'

export const TOOLTIP_TEXT_COLOR = '#FFFFFF'
export const TOOLTIP_BACKGROUND_OPACITY = 0.6

export interface TooltipAppearance {
  backgroundColor: string
  borderColor: string
  textStyle: { color: string }
}

export const createTooltipAppearance = (primary: string): TooltipAppearance => ({
  backgroundColor: withOpacity(primary, TOOLTIP_BACKGROUND_OPACITY),
  borderColor: primary,
  textStyle: { color: TOOLTIP_TEXT_COLOR },
})

/** Element Plus 提供的 popper-style 接口，变量仅作用于当前提示框。 */
export const tooltipPopperStyle = (tooltip?: Partial<TooltipAppearance>) => ({
  '--el-popper-bg-color-dark': tooltip?.backgroundColor,
  '--el-text-color-primary': tooltip?.borderColor,
  '--el-bg-color': tooltip?.textStyle?.color ?? TOOLTIP_TEXT_COLOR,
})
