import { shallowReactive } from 'vue'

// 只同步运行时字段名供配置面板选择，不保存数据行、不写入页面配置。
export const tableColumnFields = shallowReactive(new WeakMap<object, string[]>())
