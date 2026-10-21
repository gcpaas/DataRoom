import type { ChartPlugin } from '../../components/type/ChartPlugin.ts'
import type { ComponentLibTagInterface } from '../types/ComponentLibTagInterface.ts'

export interface ComponentGroup {
  tag: string
  name: string
  plugins: ChartPlugin[]
}

/** 分类与组内顺序均沿用注册表，多标签组件可跨组展示。 */
export function groupComponents(
  plugins: ChartPlugin[],
  categories: ComponentLibTagInterface[],
  query: string,
): ComponentGroup[] {
  const keyword = query.trim().toLocaleLowerCase()
  const matches = plugins.filter((plugin) =>
    [plugin.name, plugin.desc].some((text) => text.toLocaleLowerCase().includes(keyword)),
  )
  const groups = categories.map(({ tag, name }) => ({
    tag,
    name,
    plugins: matches.filter((plugin) => plugin.tags.includes(tag)),
  }))
  const knownTags = new Set(categories.map(({ tag }) => tag))
  const others = matches.filter((plugin) => !plugin.tags.some((tag) => knownTags.has(tag)))
  if (others.length) groups.push({ tag: '__other__', name: '其他', plugins: others })
  return groups.filter((group) => group.plugins.length > 0)
}

/** 分组顶部位置必须换算到滚动内容坐标系；到底时允许短末组激活。 */
export function getActiveComponentGroup(
  groups: { tag: string; top: number }[],
  scrollTop: number,
  viewportHeight: number,
  scrollHeight: number,
): string {
  if (!groups.length) return ''
  if (scrollHeight > viewportHeight && scrollTop + viewportHeight >= scrollHeight - 2) {
    return groups[groups.length - 1]!.tag
  }
  let active = groups[0]!.tag
  for (const group of groups) {
    if (group.top > scrollTop + 16) break
    active = group.tag
  }
  return active
}
