import type { ChartPreset } from '../../components/type/ChartPreset.ts'
import { PageType } from '../../constants/PageType.ts'

/** 注册时仅校验元信息，实例在用户插入组件时创建。 */
export function createPresetRegistry(entries: readonly ChartPreset[], registeredComponentTypes: readonly string[]) {
  const parentTypes = new Set(registeredComponentTypes)
  const entriesById = new Map<string, ChartPreset>()
  for (const entry of entries) {
    if (entriesById.has(entry.id)) {
      throw new Error(`组件入口 ID 重复：${entry.id}`)
    }
    if (!parentTypes.has(entry.componentType)) {
      throw new Error(`组件入口 ${entry.id} 的父组件 ${entry.componentType} 未注册`)
    }
    entriesById.set(entry.id, entry)
  }

  const createFromPreset = (id: string, pageType: PageType) => {
    if (pageType !== PageType.PAGE && pageType !== PageType.VISUAL_SCREEN) {
      throw new Error(`无效的页面类型 ${pageType}`)
    }
    const entry = entriesById.get(id)
    if (!entry) {
      throw new Error(`未注册的组件入口 ${id}`)
    }
    const chart = entry.getInstance(pageType)
    if (chart.type !== entry.componentType) {
      throw new Error(`组件入口 ${id} 返回的类型 ${chart.type} 与父组件 ${entry.componentType} 不匹配`)
    }
    return chart
  }

  return { createFromPreset }
}
