import type {Ref} from "vue";
import type {ComponentInternalInstance} from "vue";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";
import type {ChartParentRef} from "@/dataroom-packages/_common/editor-history.ts";

export type ChartLayerMoveDirection = 'up' | 'down' | 'top' | 'bottom'

/**
 * 画布实例
 */
export interface CanvasInst {
  /**
   * 新增图表，返回图表实例
   * @param type
   */
  addChart: (type: string) => ChartConfig<unknown>
  /**
   * 获取所有图表配置
   */
  chartList: Ref<Array<ChartConfig<unknown>>>
  /**
   * 激活指定图表
   * @param id
   */
  activeChartById: (id: string) => void
  /**
   * 注册图表组件实例
   * @param charId 图表唯一表示
   * @param chartInstance 实例对象
   */
  registerChartInstance: (charId: string, chartInstance: ComponentInternalInstance | null) => void
  /**
   * 获取投入表组件实例
   * @param charId
   */
  getChartInstanceById: (charId: string) => ComponentInternalInstance
  /**
   * 触发组件行为
   * @param action
   */
  triggerChartAction: (charId: string, action: ChartAction, data: unknown) => unknown
  /**
   * 触发图表行为
   * @param charId
   * @param behaviorName 触发的行为事件名称
   * @param triggerData 触发时额外的参数
   */
  triggerChartBehavior: (charId: string, behaviorEventName: string, triggerData: unknown) => unknown
  /**
   * 填充数据集参数
   * @param chart
   */
  fillDatasetParams: (chart: ChartConfig<unknown>) => Record<string, unknown>
  /**
   * 获取指定名称全局变量值
   * @param globalVariableName
   */
  getGlobalVariableValue: (globalVariableName: string) => unknown
  /**
   * 更新指定名称全局变量值
   * @param globalVariableName
   * @param value
   */
  updateGlobalVariableValue: (globalVariableName: string, value: string) => void
  /**
   * 提交新增组件到历史记录
   * @param chart
   * @param label
   */
  commitChartAdd: (chart: ChartConfig<unknown>, label?: string, parent?: ChartParentRef, index?: number) => void
  /**
   * 回退
   */
  undo: () => boolean
  /**
   * 重做
   */
  redo: () => boolean
  /**
   * 当前是否可回退
   */
  readonly canUndo: boolean
  /**
   * 当前是否可重做
   */
  readonly canRedo: boolean
  /**
   * 调整图层顺序
   * @param chartId
   * @param direction
   */
  moveChartLayer: (chartId: string, direction: ChartLayerMoveDirection) => boolean
  /**
   * 删除组件
   * @param chartId
   */
  deleteChart: (chartId: string) => boolean
  /**
   * 更新组件隐藏状态
   * @param chartId
   * @param hidden
   */
  setChartHidden: (chartId: string, hidden: boolean) => boolean
}
