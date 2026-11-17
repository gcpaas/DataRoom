import type { DrHeatmapChartPropsInterface } from './install'
import { DEFAULT_NEUTRAL_COLOR } from '../../theme/defaults'

/** 兼容已保存的首版配置，仅补齐新增字段，保留已有边框、标签和范围。 */
export function upgradeHeatmapProps(props: DrHeatmapChartPropsInterface): void {
  const legacy = props as DrHeatmapChartPropsInterface & {
    visualMap?: { min?: number; max?: number; colors?: string[] }
  }
  props.series.backgroundColor ??= legacy.visualMap?.colors?.[0] || props.tooltip.borderColor
  props.series.segments ??= 5
  props.series.min ??= legacy.visualMap?.min ?? 0
  props.series.max ??= legacy.visualMap?.max ?? 100
  for (const axis of [props.xAxis, props.yAxis]) {
    axis.nameTextStyle ??= { fontSize: 12, color: DEFAULT_NEUTRAL_COLOR }
  }
  delete legacy.visualMap
}
