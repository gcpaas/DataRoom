import type {BehaviorEventParam} from "@/dataroom-packages/components/type/BehaviorEventParam.ts";

/**
 * 行为交互定义
 */
export interface Behavior {
  // 事件名称、用于显示
  name: string
  // 事件描述、用于说明
  desc: string
  // 事件触发时指定的方法名称、用于调用
  method: string
  // 参数列表
  paramsList: Array<BehaviorEventParam>
}
