import {reactive, type Ref} from 'vue'
import {getChartById} from '@/dataRoom/utils/index.ts'
import {type ComponentInternalInstance} from 'vue'
import {ElMessage} from "element-plus";
import router from '@/router'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import {
  asCodeGlobalVariableConfig,
  asStaticGlobalVariableConfig,
  asUrlGlobalVariableConfig,
  type GlobalVariable
} from "@/dataRoom/designer/types/GlobalVariable.ts";
import type {CanvasInst, ChartLayerMoveDirection, TriggerBehaviorPayload} from "@/dataRoom/designer/types/CanvasInst.ts";
import type {
  ChartAction,
  CodeBlockActionConfig,
  NavigateActionConfig,
  TargetChartActionConfig,
  UpdateGlobalVariableActionConfig,
} from "@/dataRoom/components/type/ChartAction.ts";
import {isTargetChartActionConfig} from "@/dataRoom/components/type/ChartAction.ts";
import type {BehaviorEventParam} from "@/dataRoom/components/type/BehaviorEvent.ts";
import type {ChartParentRef} from '@/dataRoom/designer/utils/editor-history.ts'
import {resolveDatasetParamValue} from '@/dataRoom/hooks/use-canvas-inst/dataset-params.ts'
import type {PageBasicConfig} from '@/dataRoom/page-designer/type/PageBasicConfig.ts'

type ChartInstanceMap = Record<string, ComponentInternalInstance>
type BehaviorActionConfig = {
  disabled: boolean
  actions: ChartAction[]
}

interface UseCanvasInstOptions {
  chartList: Ref<ChartConfig<unknown>[]>
  globalVariable: Ref<GlobalVariable[]>
  basicConfig?: Ref<PageBasicConfig>
  addChart?: (type: string) => ChartConfig<unknown>
  activeChartById?: (id: string) => void
  commitChartAdd?: (chart: ChartConfig<unknown>, label?: string, parent?: ChartParentRef, index?: number) => void
  undo?: () => boolean
  redo?: () => boolean
  canUndo?: () => boolean
  canRedo?: () => boolean
  moveChartLayer?: (chartId: string, direction: ChartLayerMoveDirection) => boolean
  deleteChart?: (chartId: string) => boolean
  setChartHidden?: (chartId: string, hidden: boolean) => boolean
}

/**
 * 创建画布实例的组合式函数
 * 用于在设计器和预览器中共享组件实例管理逻辑
 * @param options
 */
export function useCanvasInst(options: UseCanvasInstOptions) {
  const {chartList, globalVariable, basicConfig, addChart, activeChartById, commitChartAdd, undo, redo, canUndo, canRedo, moveChartLayer, deleteChart, setChartHidden} = options

  const chartInstanceMap: ChartInstanceMap = {}

  const findGlobalVariable = (globalVariableName: string): GlobalVariable | null => {
    return globalVariable.value.find((globalVar) => globalVar?.name === globalVariableName) || null
  }

  const findChartForAction = (targetChartId: string, actionName: string): ChartConfig<unknown> | null => {
    try {
      return getChartById(targetChartId, chartList.value)
    } catch (error) {
      console.warn(`动作 [${actionName}] 跳过不存在的目标组件 ${targetChartId}:`, error)
      ElMessage.warning(`动作 [${actionName}] 的目标组件不存在，已跳过`)
      return null
    }
  }

  const handleTargetChartAction = (config: TargetChartActionConfig, actionName: string) => {
    for (const targetChartId of config.targetChartIds) {
      const targetChart = findChartForAction(targetChartId, actionName)
      if (!targetChart) {
        continue
      }
      if (config.type === 'show') {
        targetChart.hide = false
      } else if (config.type === 'hide') {
        targetChart.hide = true
      } else if (config.type === 'toggleVisibility') {
        targetChart.hide = !targetChart.hide
      }
    }
  }

  const handleRefreshDataAction = async (config: TargetChartActionConfig, actionName: string) => {
    for (const targetChartId of config.targetChartIds) {
      const targetChart = findChartForAction(targetChartId, actionName)
      if (!targetChart) {
        continue
      }
      try {
        const chartInstance = canvasInst.getChartInstanceById(targetChart.id)
        await chartInstance.exposed?.autoRefreshData?.()
      } catch (error) {
        console.warn(`动作 [${actionName}] 刷新组件 ${targetChart.id} 数据失败:`, error)
        ElMessage.warning(`动作 [${actionName}] 刷新组件数据失败，已跳过`)
      }
    }
  }

  const handleNavigateAction = async (config: NavigateActionConfig) => {
    const url = config.url?.trim()
    if (!url) {
      ElMessage.warning('页面跳转地址不能为空')
      return
    }
    if (config.target === 'blank') {
      window.open(url, '_blank')
      return
    }
    if (config.mode === 'internal') {
      await router.push(url)
      return
    }
    window.location.href = url
  }

  const handleUpdateGlobalVariableAction = (config: UpdateGlobalVariableActionConfig, data: unknown, actionName: string) => {
    if (!config.globalVariableName) {
      console.warn(`动作 [${actionName}] 未配置全局变量名称，已跳过`)
      ElMessage.warning(`动作 [${actionName}] 未配置全局变量名称，已跳过`)
      return
    }
    if (!config.bepName) {
      console.warn(`动作 [${actionName}] 未配置参数名称，已跳过`)
      ElMessage.warning(`动作 [${actionName}] 未配置参数名称，已跳过`)
      return
    }
    if (!data || typeof data !== 'object') {
      console.warn(`动作 [${actionName}] 缺少行为参数，已跳过`)
      ElMessage.warning(`动作 [${actionName}] 缺少行为参数，已跳过`)
      return
    }
    const params = data as Record<string, unknown>
    if (!(config.bepName in params)) {
      console.warn(`动作 [${actionName}] 行为参数中不存在 ${config.bepName}，已跳过`)
      ElMessage.warning(`动作 [${actionName}] 行为参数不存在，已跳过`)
      return
    }
    const value = params[config.bepName]
    if (value === undefined || value === null) {
      console.warn(`动作 [${actionName}] 行为参数 ${config.bepName} 为空，已跳过`)
      ElMessage.warning(`动作 [${actionName}] 行为参数为空，已跳过`)
      return
    }
    canvasInst.updateGlobalVariableValue(config.globalVariableName, String(value))
  }

  const handleCodeBlockAction = async (config: CodeBlockActionConfig, data: unknown) => {
    const behaviorEventParam: BehaviorEventParam = {
      canvasInst: canvasInst,
      params: data
    }
    const func = new Function('bep', `${config.code}`)
    await func(behaviorEventParam)
  }

  const executeBehaviorActions = async (sourceId: string, behavior: BehaviorActionConfig | undefined, triggerData: unknown) => {
    if (!behavior) {
      return
    }
    if (behavior.disabled || !behavior.actions || behavior.actions.length === 0) {
      return
    }
    for (let i = 0; i < behavior.actions.length; i++) {
      const action = behavior.actions[i]
      if (!action) {
        continue
      }
      try {
        await canvasInst.triggerChartAction(sourceId, action, triggerData)
      } catch (error) {
        console.error(`行为动作 [${action.name}] 执行失败:`, error)
        ElMessage.error(`行为动作 [${action.name}] 执行失败: ${error}`)
      }
    }
  }

  const triggerBehavior = async (payload: TriggerBehaviorPayload) => {
    if (payload.sourceType === 'chart') {
      let chart: ChartConfig<unknown> | null = null
      try {
        chart = getChartById(payload.sourceId, chartList.value)
      } catch (error) {
        console.warn(`组件 ${payload.sourceId} 不存在，交互行为已跳过:`, error)
        ElMessage.warning(`组件 ${payload.sourceId} 不存在，交互行为已跳过`)
        return
      }
      if (!chart?.behaviors) {
        return
      }
      await executeBehaviorActions(chart.id, chart.behaviors[payload.behaviorName], payload.triggerData)
      return
    }
    if (payload.sourceType === 'timer') {
      const timer = basicConfig?.value?.timers?.find((item) => item.id === payload.sourceId)
      if (!timer) {
        console.warn(`定时器 ${payload.sourceId} 不存在，已跳过`)
        ElMessage.warning(`定时器 ${payload.sourceId} 不存在，已跳过`)
        return
      }
      const behavior = timer?.behaviors?.[payload.behaviorName as 'tick']
      await executeBehaviorActions(payload.sourceId, behavior, payload.triggerData)
    }
  }

  const canvasInst = reactive<CanvasInst>({
    chartList: chartList,
    addChart: addChart || (() => {
      throw new Error('addChart方法未实现')
    }),
    activeChartById: activeChartById || (() => {
      throw new Error('activeChartById方法未实现')
    }),
    fillDatasetParams: (chart: ChartConfig<unknown>) => {
      const paramMap: Record<string, unknown> = {}
      const datasetParams = chart.dataset.params
      if (!datasetParams) {
        console.warn(`组件 ${chart.id} 数据集 ${chart.dataset.code} 参数未配置`)
        return paramMap
      }
      for (const paramName of Object.keys(datasetParams)) {
        const paramConfig = datasetParams[paramName]
        if (!paramConfig) {
          console.error(`组件 ${chart.id} 数据集参数 ${paramName} 未正确配置`)
          continue
        }
        // 默认使用默认值
        let paramValue = paramConfig.defaultValue
        paramMap[paramName] = paramValue
        if (paramConfig.from === 'fixed') {
          // 固定值：使用默认值
          paramValue = paramConfig.defaultValue
          paramMap[paramName] = paramValue
          continue
        }
        if (paramConfig.from === 'globalVar') {
          if (!paramConfig.variableName) {
            console.error(`组件${chart.type}: ${chart.id} 数据集参数 ${paramName} 对应的全局变量未绑定`)
            continue
          }
          paramValue = resolveDatasetParamValue(paramConfig, canvasInst.getGlobalVariableValue(paramConfig.variableName))
          paramMap[paramName] = paramValue
        }
      }
      return paramMap
    },
    registerChartInstance: (charId: string, chartInstance: ComponentInternalInstance | null) => {
      if (!chartInstance) {
        console.error(`注册组件 ${charId} 的实例失败，实例为空`)
        return
      }
      chartInstanceMap[charId] = chartInstance
    },
    getChartInstanceById: (charId: string) => {
      const chartInstance = chartInstanceMap[charId]
      if (!chartInstance) {
        console.error(`获取组件 ${charId} 的实例失败，实例为空`)
        throw new Error(`组件 ${charId} 的实例为空`)
      }
      return chartInstance
    },
    triggerChartAction: async (charId: string = 'unknown', action: ChartAction, data: unknown) => {
      try {
        const legacyAction = action as Partial<ChartAction> & Pick<ChartAction, 'name'>
        if (!legacyAction.chartActionConfig && (action.name === 'autoRefreshData' || action.name === 'changeData')) {
          const chartInstance = canvasInst.getChartInstanceById(charId)
          await chartInstance.exposed?.triggerAction(action, data)
          return
        }
        const config = action.chartActionConfig
        if (config.type !== action.type) {
          console.warn(`动作 [${action.name}] 类型 ${action.type} 与配置类型 ${config.type} 不一致`)
        }
        if (isTargetChartActionConfig(config)) {
          if (config.type === 'refreshData') {
            await handleRefreshDataAction(config, action.name)
          } else {
            handleTargetChartAction(config, action.name)
          }
          return
        }
        if (config.type === 'navigate') {
          await handleNavigateAction(config)
          return
        }
        if (config.type === 'updateGlobalVariable') {
          handleUpdateGlobalVariableAction(config, data, action.name)
          return
        }
        if (config.type === 'code') {
          await handleCodeBlockAction(config, data)
          return
        }
        console.warn(`动作 [${action.name}] 配置无法执行，来源组件: ${charId}`)
      } catch (error) {
        console.error(`动作 [${action.name}] 执行失败:`, error)
        ElMessage.error(`动作 [${action.name}] 执行失败: ${error}`)
      }
    },
    triggerChartBehavior: async (charId: string, behaviorName: string, triggerData: unknown) => {
      await canvasInst.triggerBehavior({
        sourceType: 'chart',
        sourceId: charId,
        behaviorName,
        triggerData,
      })
    },
    triggerBehavior,
    getGlobalVariableValue: (globalVariableName: string) => {
      const globalVar = findGlobalVariable(globalVariableName)
      if (!globalVar) {
        console.warn(`全局变量 ${globalVariableName} 不存在`)
        return ''
      }
      if (globalVar.source === 'static') {
        return asStaticGlobalVariableConfig(globalVar).value
      }
      if (globalVar.source === 'url') {
        const config = asUrlGlobalVariableConfig(globalVar)
        if (!config.paramName) {
          console.error(`无法获取全局变量 ${globalVar.name} 的值，因为 URL 参数名称未配置`)
          return config.defaultValue || ''
        }
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get(config.paramName) || config.defaultValue || ''
      }
      if (globalVar.source === 'code') {
        const config = asCodeGlobalVariableConfig(globalVar)
        try {
          const behaviorEventParam: BehaviorEventParam = {
            canvasInst: canvasInst,
            params: {}
          }
          const scriptFunc = new Function('bep', config.code)
          const returnValue = scriptFunc(behaviorEventParam)
          if (returnValue === undefined || returnValue === null) {
            console.error(`全局变量 ${globalVar.name} 代码执行后未返回值`)
            return ''
          }
          return returnValue
        } catch (error) {
          console.error(`全局变量 ${globalVar.name} 的代码执行失败:`, error)
          return ''
        }
      }
      return ''
    },
    updateGlobalVariableValue: (globalVariableName: string, value: string) => {
      const globalVar = findGlobalVariable(globalVariableName)
      if (!globalVar) {
        console.warn(`全局变量 ${globalVariableName} 不存在，无法更新`)
        return
      }
      if (globalVar.source !== 'static') {
        console.warn(`全局变量 ${globalVar.name} 不是静态值来源，已跳过更新`)
        return
      }
      asStaticGlobalVariableConfig(globalVar).value = value
      if (!value) {
        console.warn(`全局变量 ${globalVar.name} 的静态值被设置为了空`)
      }
    },
    commitChartAdd: commitChartAdd || (() => {}),
    undo: undo || (() => false),
    redo: redo || (() => false),
    get canUndo() {
      return canUndo ? canUndo() : false
    },
    get canRedo() {
      return canRedo ? canRedo() : false
    },
    moveChartLayer: moveChartLayer || (() => false),
    deleteChart: deleteChart || (() => false),
    setChartHidden: setChartHidden || (() => false),
  })

  return {
    canvasInst,
    chartInstanceMap
  }
}
