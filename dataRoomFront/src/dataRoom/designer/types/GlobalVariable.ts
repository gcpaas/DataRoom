/**
 * 全局变量来源
 */
export type GlobalVariableSource = 'static' | 'url' | 'code'

/**
 * 静态值全局变量配置
 */
export interface StaticGlobalVariableConfig {
  value: string
}

/**
 * URL 参数全局变量配置
 */
export interface UrlGlobalVariableConfig {
  paramName: string
  defaultValue: string
}

/**
 * 代码块全局变量配置
 */
export interface CodeGlobalVariableConfig {
  code: string
}

export type GlobalVariableConfig = StaticGlobalVariableConfig | UrlGlobalVariableConfig | CodeGlobalVariableConfig

/**
 * 全局变量基础字段
 */
interface BaseGlobalVariable {
  id: string
  name: string
  remark: string
}

/**
 * 静态值全局变量
 */
export interface StaticGlobalVariable extends BaseGlobalVariable {
  source: 'static'
  config: StaticGlobalVariableConfig
}

/**
 * URL 参数全局变量
 */
export interface UrlGlobalVariable extends BaseGlobalVariable {
  source: 'url'
  config: UrlGlobalVariableConfig
}

/**
 * 代码块全局变量
 */
export interface CodeGlobalVariable extends BaseGlobalVariable {
  source: 'code'
  config: CodeGlobalVariableConfig
}

/**
 * 全局变量
 */
export type GlobalVariable = StaticGlobalVariable | UrlGlobalVariable | CodeGlobalVariable

export const GLOBAL_VARIABLE_SOURCE_OPTIONS: Array<{ label: string; value: GlobalVariableSource }> = [
  { label: '静态值', value: 'static' },
  { label: 'URL', value: 'url' },
  { label: '代码块', value: 'code' },
]

export const DEFAULT_CODE_GLOBAL_VARIABLE_CODE = `// 请输入JS代码
return ''`

export const getGlobalVariableSourceLabel = (source: GlobalVariableSource | string): string => {
  return GLOBAL_VARIABLE_SOURCE_OPTIONS.find((item) => item.value === source)?.label || String(source || '')
}

export const createDefaultGlobalVariableConfig = (source: GlobalVariableSource): GlobalVariableConfig => {
  if (source === 'url') {
    return {
      paramName: '',
      defaultValue: '',
    }
  }
  if (source === 'code') {
    return {
      code: DEFAULT_CODE_GLOBAL_VARIABLE_CODE,
    }
  }
  return {
    value: '',
  }
}

const assertGlobalVariableSource = <T extends GlobalVariableSource>(
  variable: GlobalVariable,
  source: T,
  sourceLabel: string
): Extract<GlobalVariable, { source: T }> => {
  if (variable.source !== source) {
    throw new Error(`全局变量 ${variable.name} 不是${sourceLabel}来源`)
  }
  return variable as Extract<GlobalVariable, { source: T }>
}

export const asStaticGlobalVariableConfig = (variable: GlobalVariable): StaticGlobalVariableConfig => {
  return assertGlobalVariableSource(variable, 'static', '静态值').config
}

export const asUrlGlobalVariableConfig = (variable: GlobalVariable): UrlGlobalVariableConfig => {
  return assertGlobalVariableSource(variable, 'url', 'URL').config
}

export const asCodeGlobalVariableConfig = (variable: GlobalVariable): CodeGlobalVariableConfig => {
  return assertGlobalVariableSource(variable, 'code', '代码块').config
}
