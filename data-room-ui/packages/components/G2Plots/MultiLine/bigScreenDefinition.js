import baseDefinition from './baseDefinition'

/**
 * 根据图表配置生成对应的实例，用于初始化
 */
function getInstance () {
  const chartDefinition = {
    ...baseDefinition,
    w: 450, // 宽度
    h: 320 // 高度
  }
  // 每个组件实现自己的初始化逻辑
  return chartDefinition
}
export default getInstance
