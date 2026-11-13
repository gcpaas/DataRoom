import type { ChartConfig } from '../components/type/ChartConfig'
import type { PageType } from '../constants/PageType'
import { componentThemeMappings } from './component-mappings'
import { applyComponentThemeDetails } from './component-details'
import { getDefaultTheme, getTheme } from './registry'
import type { ChartTheme, ThemeStylePath } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** 映射仅来自代码内注册表，不接受外部任意路径。数组逐实例复制。 */
export function applyThemeToCharts(charts: ChartConfig<unknown>[], theme: ChartTheme, options: { preserveRichTextColors?: boolean; preserveGradientOpacity?: boolean } = {}): number {
  let changed = 0
  for (const chart of charts) {
    const mapping = componentThemeMappings[chart.type]
    if (mapping && isRecord(chart.props)) {
      for (const [path, stylePath] of mapping) {
        const parts = path.split('.')
        const key = parts.pop()!
        let target = chart.props
        for (const part of parts) {
          const child = target[part]
          if (isRecord(child)) target = child
          else {
            const next: Record<string, unknown> = {}
            target[part] = next
            target = next
          }
        }
        // 新建预设保留已有渐变强度；主动切换主题仍按主题重置。
        if (options.preserveGradientOpacity && (stylePath.startsWith('series.gradient.') || stylePath.startsWith('series.barGradient.')) && typeof target[key] === 'number') continue
        const value = getThemeStyle(theme, stylePath)
        target[key] = Array.isArray(value) ? [...value] : value
      }
      applyComponentThemeDetails(chart, theme, options)
      changed += 1
    }
    if (chart.children) changed += applyThemeToCharts(chart.children, theme, options)
  }
  return changed
}

export function applyThemeToNewChart(chart: ChartConfig<unknown>, themeId: string | undefined, pageType: PageType) {
  const selectedTheme = getTheme(themeId)
  // 未指定画布主题时，普通文本使用应用默认文本色，避免浅色画布上出现白字。
  const defaultTextColor = chart.type === 'DrText' && !selectedTheme && isRecord(chart.props) && isRecord(chart.props.textStyle)
    ? chart.props.textStyle.color
    : undefined
  const defaultCategoryColor = chart.type === 'DrPictorialBarChart' && !selectedTheme && isRecord(chart.props) && isRecord(chart.props.xAxis)
    ? chart.props.xAxis.color
    : undefined
  // 新建时保留组件预设的局部文字颜色；主动切换主题仍按原规则重置。
  applyThemeToCharts([chart], selectedTheme ?? getDefaultTheme(pageType), { preserveRichTextColors: true, preserveGradientOpacity: true })
  if (defaultTextColor !== undefined && isRecord(chart.props) && isRecord(chart.props.textStyle)) {
    chart.props.textStyle.color = defaultTextColor
  }
  if (defaultCategoryColor !== undefined && isRecord(chart.props) && isRecord(chart.props.xAxis)) {
    chart.props.xAxis.color = defaultCategoryColor
  }
}


/** 相对路径仅来自类型检查过的代码内映射表。 */
export function getThemeStyle(theme: ChartTheme, stylePath: ThemeStylePath): string | number | readonly string[] {
  let value: unknown = theme
  for (const part of stylePath.split('.')) {
    if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, part)) throw new Error(`主题样式路径不存在：${stylePath}`)
    value = value[part]
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) return value
  throw new Error(`主题样式值无效：${stylePath}`)
}
