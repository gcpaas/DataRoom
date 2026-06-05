import {getCurrentInstance, inject, onMounted} from "vue";
import {datasetApi} from "@/dataroom-packages/dataset/api.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts";

interface UseDrComponentOptions {
  /**
   * 组件配置
   */
  chart: ChartConfig<unknown>
  /**
   * 获取组件实例方法
   */
  changeData?: (datasetValue: any) => void
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
  const autoRefreshData = () => {
    if (!chart.dataset?.code) {
      console.warn(`组件${chart.type}: ${chart.id} 未配置数据集`)
      return
    }
    // 生成参数 - 使用通用工具函数
    const paramMap = canvasInst.fillDatasetParams(chart)
    datasetApi.run4Chart({
      datasetCode: chart.dataset.code,
      paramMap: paramMap
    }).then((res) => {
      changeData(res.data)
    })
  }
  /**
   * 修改组件数据
   * @param datasetValue
   */
  const changeData = (datasetValue: any) => {
    if (options.changeData) {
      options.changeData(datasetValue)
      return
    }
    console.warn(`组件${chart.type}: ${chart.id} 未实现changeData方法`)
  }
  /**
   * 触发组件的动作
   * @param action 动作定义
   * @param data 关联数据
   */
  const triggerAction = (action: ChartAction, data: any) => {
    // 行为逻辑（可选）
    if (action.name == 'autoRefreshData') {
      autoRefreshData()
      return
    }
    if (action.name == 'changeData') {
      changeData(data)
      return
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
