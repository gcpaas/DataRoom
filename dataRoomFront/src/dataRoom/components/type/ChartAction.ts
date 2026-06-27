export type ChartActionType = 'show' | 'hide' | 'toggleVisibility' | 'navigate' | 'refreshData' | 'updateGlobalVariable' | 'code'

export type NavigateMode = 'external' | 'internal'

export type NavigateTarget = 'self' | 'blank'

export interface ChartActionConfig {
  type: ChartActionType
}

export interface ShowActionConfig extends ChartActionConfig {
  type: 'show'
  targetChartIds: string[]
}

export interface HideActionConfig extends ChartActionConfig {
  type: 'hide'
  targetChartIds: string[]
}

export interface ToggleVisibilityActionConfig extends ChartActionConfig {
  type: 'toggleVisibility'
  targetChartIds: string[]
}

export interface RefreshDataActionConfig extends ChartActionConfig {
  type: 'refreshData'
  targetChartIds: string[]
}

export interface NavigateActionConfig extends ChartActionConfig {
  type: 'navigate'
  mode: NavigateMode
  url: string
  target: NavigateTarget
}

export interface UpdateGlobalVariableActionConfig extends ChartActionConfig {
  type: 'updateGlobalVariable'
  globalVariableName: string
  bepName: string
}

export interface CodeBlockActionConfig extends ChartActionConfig {
  type: 'code'
  code: string
}

export type TargetChartActionConfig = ShowActionConfig | HideActionConfig | ToggleVisibilityActionConfig | RefreshDataActionConfig

export type TypedChartActionConfig = TargetChartActionConfig | NavigateActionConfig | UpdateGlobalVariableActionConfig | CodeBlockActionConfig

export interface ChartAction {
  name: string
  type: ChartActionType
  chartActionConfig: TypedChartActionConfig
}

export const CHART_ACTION_TYPE_OPTIONS: Array<{ label: string; value: ChartActionType }> = [
  { label: '显示', value: 'show' },
  { label: '隐藏', value: 'hide' },
  { label: '显隐切换', value: 'toggleVisibility' },
  { label: '页面跳转', value: 'navigate' },
  { label: '数据刷新', value: 'refreshData' },
  { label: '更新全局变量', value: 'updateGlobalVariable' },
  { label: '代码块', value: 'code' },
]

export const getChartActionTypeLabel = (type: ChartActionType | string): string => {
  return CHART_ACTION_TYPE_OPTIONS.find((item) => item.value === type)?.label || String(type || '')
}

export const isTargetChartActionConfig = (config: TypedChartActionConfig): config is TargetChartActionConfig => {
  return config.type === 'show' || config.type === 'hide' || config.type === 'toggleVisibility' || config.type === 'refreshData'
}

export const createDefaultChartActionConfig = (type: ChartActionType): TypedChartActionConfig => {
  if (type === 'navigate') {
    return {
      type,
      mode: 'external',
      url: '',
      target: 'self',
    }
  }
  if (type === 'updateGlobalVariable') {
    return {
      type,
      globalVariableName: '',
      bepName: '',
    }
  }
  if (type === 'code') {
    return {
      type,
      code: '// 请输入JS代码\n',
    }
  }
  return {
    type,
    targetChartIds: [],
  }
}

export const createDefaultChartAction = (index: number): ChartAction => {
  return {
    name: `动作${index}`,
    type: 'refreshData',
    chartActionConfig: createDefaultChartActionConfig('refreshData'),
  }
}
