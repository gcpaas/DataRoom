/**
 * 全局变量
 */
export  interface GlobalVariable {
  // 唯一标识
  id: string
  // 来源
  from: 'static' | 'url'
  // URL 参数名称
  urlName?: string
  // 变量名称
  name: string
  // 描述
  remark: string
  // 默认值
  defaultValue: string
  // JS脚本
  script?: string
}
