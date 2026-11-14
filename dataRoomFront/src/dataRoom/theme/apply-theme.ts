import type { ChartConfig } from '../components/type/ChartConfig'
import { componentThemeMappings } from './component-mappings'
import { applyComponentThemeDetails } from './component-details'
import type { ChartTheme, ThemeStylePath } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** 映射仅来自代码内注册表，不接受外部任意路径。数组逐实例复制。 */
export function applyThemeToCharts(charts: ChartConfig<unknown>[], theme: ChartTheme): number {
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
        const value = getThemeStyle(theme, stylePath)
        target[key] = Array.isArray(value) ? [...value] : value
      }
      applyComponentThemeDetails(chart, theme)
      changed += 1
    }
    if (chart.children) changed += applyThemeToCharts(chart.children, theme)
  }
  return changed
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
