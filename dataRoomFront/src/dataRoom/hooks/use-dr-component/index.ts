import {getCurrentInstance, inject, onMounted} from "vue";
import {datasetApi} from "@/dataRoom/dataset/api.ts";
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import {DrConst} from "@/dataRoom/constants/DrConst.ts";
import type {CanvasInst} from "@/dataRoom/designer/types/CanvasInst.ts";
import type {ChartAction} from "@/dataRoom/components/type/ChartAction.ts";
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts";
import {isStreamingDatasetType} from "@/dataRoom/dataset/streaming-dataset.ts";

interface UseDrComponentOptions {
  /**
   * 组件配置
   */
  chart: ChartConfig<unknown>
  /**
   * 获取组件实例方法
   */
  changeData?: (datasetValue: unknown) => void | Promise<void>
}


/**
 * 自动注册组件到画布、内置固定数据处理方法
 * @param options
 */
export function useDrComponent(options: UseDrComponentOptions) {
  const chart = options.chart
  const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
  const currentInstance = getCurrentInstance()

  /**
   * 将当前图表组件实例注册到画布中，便于后期统一调用
   */
  const registerCurrentInstance = () => {
    canvasInst.registerChartInstance(chart.id, currentInstance)
  }
  /**
   * 自动更新组件数据
   */
  const autoRefreshData = async () => {
    if (!chart.dataset?.code) {
      console.warn(`组件${chart.type}: ${chart.id} 未配置数据集`)
      return
    }
    if (isStreamingDatasetType(chart.dataset.datasetType)) {
      return
    }
    // 生成参数 - 使用通用工具函数
    const paramMap = canvasInst.fillDatasetParams(chart)
    const res = await datasetApi.run4Chart({
      datasetCode: chart.dataset.code,
      paramMap: paramMap
    })
    await changeData(res.data)
  }
  /**
   * 修改组件数据
   * @param datasetValue
   */
  const changeData = (datasetValue: unknown) => {
    if (options.changeData) {
      return options.changeData(datasetValue)
    }
    console.warn(`组件${chart.type}: ${chart.id} 未实现changeData方法`)
  }
  /**
   * 触发组件的动作
   * @param action 动作定义
   * @param data 关联数据
   */
  const triggerAction = (action: ChartAction, data: unknown) => {
    // 行为逻辑（可选）
    if (action.name == 'autoRefreshData') {
      return autoRefreshData()
    }
    if (action.name == 'changeData') {
      return changeData(data)
    }
    console.error(`组件${chart.type}: ${chart.id} 暂不支持 ${action.name} 方法调用`)
  }

  onMounted(() => {
    registerCurrentInstance()
    expose.autoRefreshData()
  })

  /**
   * 用于导出的方法，便于动作执行
   */
  const expose: ComponentExpose = {
    autoRefreshData: autoRefreshData,
    changeData: changeData,
    triggerAction: triggerAction
  }

  return {
    canvasInst: canvasInst,
    expose: expose
  }
}
