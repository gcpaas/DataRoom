import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import {v4 as uuidv4} from 'uuid'
import {PageType} from '@/dataRoom/constants/PageType.ts'
/**
 * 创建 ChartConfig 基础配置的工厂函数
 * @param type 组件类型
 * @param props 组件个性化配置
 * @param overrides 需要覆盖的配置项
 * @param pageType 页面类型，仅支持普通页面和可视化大屏
 * @param pageSize 普通页面网格尺寸，默认 16×10
 * @returns 完整的 ChartConfig 对象
 */
export function createChartConfig<T>(
  type: string,
  props: T,
  overrides: Partial<Omit<ChartConfig<T>, 'type' | 'props'>> | undefined,
  pageType: PageType,
  pageSize: {w: number; h: number} = {w: 16, h: 10}
): ChartConfig<T> {
  if (pageType !== PageType.PAGE && pageType !== PageType.VISUAL_SCREEN) {
    throw new Error('不支持的页面类型，仅支持 PAGE 或 VISUAL_SCREEN')
  }
  const id = uuidv4()
  const config: ChartConfig<T> = {
    id: id,
    i: id,
    type: type,
    title: '未命名组件',
    w: 150,
    h: 100,
    x: 100,
    y: 100,
    z: 100,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    props: props,
    behaviors: {},
    dataset: {
      code: '',
      datasetType: '',
      fields: {},
      script: '',
      params: {}
    },
    ...overrides,
  }
  if (pageType === PageType.PAGE) {
    config.w = pageSize.w
    config.h = pageSize.h
  }
  return config
}
