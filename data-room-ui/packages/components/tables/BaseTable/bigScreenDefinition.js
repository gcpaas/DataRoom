import baseDefinition from './baseDefinition'

/**
 * 根据图表配置生成对应的实例，用于初始化
 */
function getInstance(){
  let chartDefinition = {
    ...baseDefinition
  }
  // 每个组件实现自己的初始化逻辑
  chartDefinition.id = `chart${new Date().getTime()}`
  return chartDefinition
}
export default getInstance
