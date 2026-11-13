import type {Ref} from "vue";
import type {ComponentInternalInstance} from "vue";
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import type {ChartAction} from "@/dataRoom/components/type/ChartAction.ts";
import type {ChartLayoutState, ChartParentRef} from "@/dataRoom/designer/utils/editor-history.ts";

export type ChartLayerMoveDirection = 'up' | 'down' | 'top' | 'bottom'

export type BehaviorSourceType = 'chart' | 'timer'

export interface TriggerBehaviorPayload {
  sourceType: BehaviorSourceType
  sourceId: string
  behaviorName: string
  triggerData: unknown
}

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
   * 按组件库入口 ID 新增图表，保留实际父组件类型
   */
  addChartFromPreset: (id: string) => ChartConfig<unknown>
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
  triggerChartAction: (charId: string, action: ChartAction, data: unknown) => Promise<void>
  /**
   * 触发图表行为
   * @param charId
   * @param behaviorName 触发的行为事件名称
   * @param triggerData 触发时额外的参数
   */
  triggerChartBehavior: (charId: string, behaviorEventName: string, triggerData: unknown) => Promise<void>
  /**
   * 触发统一行为事件
   * @param payload 触发源、行为名称与参数
   */
  triggerBehavior: (payload: TriggerBehaviorPayload) => Promise<void>
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
   * 调整图层顺序（基于 z 值操作：置顶=maxZ+1、置底=minZ-1、上移/下移=与相邻层交换或越过）
   * @param chartId
   * @param direction
   */
  moveChartLayer: (chartId: string, direction: ChartLayerMoveDirection) => boolean
  /**
   * 设置组件图层值（任意整数，可为负数；z 越大越靠顶层，同 z 按数组顺序后者在上）
   * @param chartId
   * @param z 目标图层值
   */
  setChartLayerZ: (chartId: string, z: number) => boolean
  /**
   * 提交组件布局（x/y/w/h/旋转）变更到历史记录
   * @param chartId
   * @param before 变更前布局快照
   * @param after 变更后布局快照
   * @param label 历史记录标签，默认为「调整位置尺寸」
   */
  commitChartLayout: (chartId: string, before: ChartLayoutState, after: ChartLayoutState, label?: string) => void
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
