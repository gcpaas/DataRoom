import baseDefinition from './baseDefinition'

/**
 * 根据图表配置生成对应的实例，用于初始化
 */
function getInstance () {
  const chartDefinition = {
    ...baseDefinition,
    w: 182,
    h: 40
  }
  return chartDefinition
}

export default getInstance
