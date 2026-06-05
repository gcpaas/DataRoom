import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import {v4 as uuidv4} from 'uuid'
/**
 * 创建 ChartConfig 基础配置的工厂函数
 * @param type 组件类型
 * @param props 组件个性化配置
 * @param overrides 需要覆盖的配置项
 * @returns 完整的 ChartConfig 对象
 */
export function createChartConfig<T>(
  type: string,
  props: T,
  overrides?: Partial<Omit<ChartConfig<T>, 'type' | 'props'>>
): ChartConfig<T> {
  const id = uuidv4()
  return {
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
      fields: {},
      script: '',
      params: {}
    },
    ...overrides,
  }
}
