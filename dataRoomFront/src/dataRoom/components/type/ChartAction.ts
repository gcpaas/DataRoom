export interface ChartAction {
  // 动作描述
  name: string
  // 动作类型，暂时仅支持高代码
  type: string | 'code'
  // JS代码
  code: string
}
