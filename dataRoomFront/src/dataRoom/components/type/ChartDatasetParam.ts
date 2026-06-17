
/**
 * 图表数据集参数定义
 */
export interface ChartDatasetParam {
  // 来源，暂时仅支持全局变量、固定值
  from: string | 'globalVar' | 'fixed'
  // 变量名称、仅当 from = globalVar 时有效
  variableName: string
  // 默认值、或固定值
  defaultValue: any
}
