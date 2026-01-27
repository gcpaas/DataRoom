import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";

export interface PageTimer {
// 定时器ID
  id: string
  // 定时器名称
  name: string
  // 是否启用
  enabled: boolean
  // 定时器间隔，单位毫秒
  interval: number
  // 执行的动作
  actions: ChartAction[]
}
