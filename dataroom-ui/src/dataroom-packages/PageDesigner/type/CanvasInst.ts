import type {Ref} from "vue";
import type {ComponentInternalInstance} from "@vue/runtime-core";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";

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
  triggerChartAction: (charId: string, action: ChartAction, data: any) => any
  /**
   * 触发图表行为
   * @param charId
   * @param behaviorName 触发的行为事件名称
   * @param triggerData 触发时额外的参数
   */
  triggerChartBehavior: (charId: string, behaviorEventName: string, triggerData: any) => any
  /**
   * 填充数据集参数
   * @param chart
   */
  fillDatasetParams: (chart: ChartConfig<unknown>) => Record<string, any>
  /**
   * 获取指定名称全局变量值
   * @param globalVariableName
   */
  getGlobalVariableValue: (globalVariableName: string) => any
  /**
   * 更新指定名称全局变量值
   * @param globalVariableName
   * @param value
   */
  updateGlobalVariableValue: (globalVariableName: string, value: any) => void
}
