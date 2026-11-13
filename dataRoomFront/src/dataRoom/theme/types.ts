/** 精简主题样式：组件通过相对路径复用这些语义参数。 */
export interface ThemeStyles {
  color: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
  }
  text: { primary: string; secondary: string; disabled: string }
  background: { primary: string; secondary: string }
  border: { primary: string; secondary: string }
  series: {
    colors: readonly string[]
    /** 柱体需要保持清晰，独立于低透明度的面积填充。 */
    barGradient: { startOpacity: number; endOpacity: number }
    gradient: { startOpacity: number; endOpacity: number }
    point: { fillOpacity: number }
  }
}

/** 样式直接位于主题根级，不需要 tokens/styles 前缀。 */
export interface ChartTheme extends ThemeStyles {
  id: string
  name: string
  description: string
}

/** 数组是叶子值，不暴露下标或数组方法作为映射路径。 */
export type LeafPath<T> = T extends object ? {
  [K in keyof T & string]: NonNullable<T[K]> extends readonly unknown[] ? K
    : NonNullable<T[K]> extends object ? `${K}.${LeafPath<NonNullable<T[K]>>}` : K
}[keyof T & string] : never

export type ThemeStylePath = LeafPath<ThemeStyles>
export type ThemeMapping<Props = Record<string, unknown>> = readonly (
  readonly [path: LeafPath<Props>, stylePath: ThemeStylePath]
)[]
