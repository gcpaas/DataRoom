/**
 * 数据集字段类型显示映射。
 * 存储值保持英文不变（与后端 TypeUtils.parseType 及组件绑定约定一致），
 * 仅在界面展示时转换为中文；未命中的类型原样展示。
 */
export const fieldTypeLabels: Record<string, string> = {
  String: '字符串',
  Number: '数值',
  int: '整数',
  Integer: '整数',
  Long: '整数',
  Double: '小数',
  Boolean: '布尔',
  Object: '对象',
  Array: '数组',
  Date: '日期',
  string: '字符串',
  number: '数值',
  boolean: '布尔',
}

/**
 * 获取字段类型的中文显示文案，空值或未命中时回退为原值。
 */
export function fieldTypeLabel(type?: string | null): string {
  if (!type) {
    return ''
  }
  return fieldTypeLabels[type] ?? type
}
