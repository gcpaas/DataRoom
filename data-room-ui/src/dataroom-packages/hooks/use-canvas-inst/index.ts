import {reactive, type Ref} from 'vue'
import {getChartById} from '@/dataroom-packages/_common/_utils.ts'
import {type ComponentInternalInstance} from '@vue/runtime-core'
import {ElMessage} from "element-plus";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";
import type {BehaviorEventParam} from "@/dataroom-packages/components/type/BehaviorEvent.ts";

type ChartInstanceMap = Record<string, ComponentInternalInstance>

interface UseCanvasInstOptions {
  chartList: Ref<ChartConfig<unknown>[]>
  globalVariable: Ref<GlobalVariable[]>
  addChart?: (type: string) => ChartConfig<unknown>
  activeChartById?: (id: string) => void
}

/**
 * 创建画布实例的组合式函数
 * 用于在设计器和预览器中共享组件实例管理逻辑
 * @param options
 */
export function useCanvasInst(options: UseCanvasInstOptions) {
  const {chartList, globalVariable, addChart, activeChartById} = options

  const chartInstanceMap: ChartInstanceMap = {}

  const canvasInst = reactive<CanvasInst>({
    chartList: chartList,
    addChart: addChart || (() => {
      throw new Error('addChart方法未实现')
    }),
    activeChartById: activeChartById || (() => {
      throw new Error('activeChartById方法未实现')
    }),
    fillDatasetParams: (chart: ChartConfig<unknown>) => {
      const paramMap: Record<string, any> = {}
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
          paramValue = canvasInst.getGlobalVariableValue(paramConfig.variableName)
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
    triggerChartAction: (charId: string = 'unknown', action: ChartAction, data: any) => {
      if (action.type === 'code') {
        try {
          const behaviorEventParam: BehaviorEventParam = {
            canvasInst: canvasInst,
            params: data
          }
          const func = new Function('bep', `${action.code}`)
          func(behaviorEventParam)
        } catch (error) {
          console.error(`动作 [${action.name}] 执行失败:`, error)
          ElMessage.error(`动作 [${action.name}] 执行失败: ${error}`)
        }
        return
      }
      const chartInstance = canvasInst.getChartInstanceById(charId)
      chartInstance.exposed?.triggerAction(action, data)
      return
    },
    triggerChartBehavior: (charId: string, behaviorName: string, triggerData: any) => {
      const chart = getChartById(charId, chartList.value)
      if (!chart) {
        return
      }
      if (!chart.behaviors) {
        return
      }
      for (const key of Object.keys(chart.behaviors)) {
        if (behaviorName !== key) {
          continue
        }
        const behavior = chart.behaviors[key]
        if (!behavior) {
          continue
        }
        if (behavior.disabled) {
          continue
        }
        if (!behavior.actions || behavior.actions.length == 0) {
          continue
        }
        for (let i = 0; i < behavior.actions.length; i++) {
          const action = behavior.actions[i]
          if (!action) {
            continue
          }
          canvasInst.triggerChartAction(chart.id, action, triggerData)
        }
      }
    },
    getGlobalVariableValue: (globalVariableName: string) => {
      let paramValue = ''
      for (let i = 0; i < globalVariable.value.length; i++) {
        const globalVar = globalVariable.value[i]
        if (!globalVar) {
          continue
        }
        if (globalVar.name !== globalVariableName) {
          continue
        }
        if (globalVar.from === 'static') {
          // 静态变量：直接使用默认值
          paramValue = globalVar.defaultValue
        } else if (globalVar.from === 'url') {
          if (!globalVar.urlName) {
            console.error(`无法获取全局变量${globalVar.name} 的值，因为${globalVar.name}对应的URL参数名称未配置`)
            return ''
          }
          const urlParams = new URLSearchParams(window.location.search)
          paramValue = urlParams.get(globalVar.urlName) || globalVar.defaultValue
        }
        // 如果配置了脚本，执行脚本处理
        if (globalVar.script && globalVar.script.trim()) {
          let scriptFunc = null
          try {
            // 使用 Function 构造器创建并执行脚本
            const behaviorEventParam: BehaviorEventParam = {
              canvasInst: canvasInst,
              params: {}
            }
            scriptFunc = new Function('bep', globalVar.script)
            let returnValue = scriptFunc(behaviorEventParam)
            if (!returnValue) {
              console.error(`全局变量: ${globalVar.name} 脚本执行后未返回值`)
              returnValue = paramValue
            }
            paramValue = returnValue
          } catch (error) {
            console.error(`全局变量  ${globalVar.name} 的脚本失败, 异常: `, error)
          } finally {
            if (scriptFunc != null) {
              scriptFunc = null
            }
          }
        }
      }
      return paramValue;
    },
    updateGlobalVariableValue: (globalVariableName: string, value: any) => {
      for (let i = 0; i < globalVariable.value.length; i++) {
        const globalVar = globalVariable.value[i]
        if (!globalVar) {
          continue
        }
        if (globalVar.name !== globalVariableName) {
          continue
        }
        globalVar.defaultValue = value
        if (!value) {
          console.warn(`全局变量 ${globalVar.name} 的默认值被设置为了空`)
        }
      }
    }
  })

  return {
    canvasInst,
    chartInstanceMap
  }
}
