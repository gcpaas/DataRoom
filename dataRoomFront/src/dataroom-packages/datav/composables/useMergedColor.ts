import type { Ref } from 'vue'

/**
 * 如果 colors 没有传入颜色，则返回默认颜色，反之则返回传入的颜色
 * @param defaultColors 默认颜色
 * @param colors props 传入颜色
 * @returns 最终颜色
 */
export function useMergedColor(defaultColors: string[], colors: Ref<string[]>) {
  return computed(() => colors.value.length === 0 ? defaultColors : colors.value)
}
