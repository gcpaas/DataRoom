import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";

/**
 * 组件必须实现的方法接口
 */
export interface ComponentExpose {
  /**
   * 更新数据、先获取数据集、然后 changeData
   */
  autoRefreshData: () => void | Promise<void>
  /**
   * 修改数据、不用重新获取数据集，直接用给定的数据刷新
   * @param data
   */
  changeData: (data: any) => void | Promise<void>
  /**
   * 触发组件行为方法，用于通过组件实例方法调用
   * @param action
   * @param data 其他方法入参
   */
  triggerAction: (action: ChartAction, data: any) => void | Promise<void>
}
