// 可以从 bigScreenDefinition.js 导出 getInstance 方法执行，对执行后的结果进行定制化配置
import * as bigScreenDefinitionGetInstance from './bigScreenDefinition.js'

/**
 * 根据图表配置生成对应的实例，用于初始化
 */
function getInstance () {
  // 情况1： 如果差别比较大，可以重新配置一份
  // let chartDefinition = {
  //   ...baseDefinition
  // }

  // 情况2：如果差别不大，可以基于已有大屏配置进行定制化配置
  const chartDefinition = bigScreenDefinitionGetInstance()
  // 每个组件实现自己的初始化逻辑
  chartDefinition.id = `chart${new Date().getTime()}`
  chartDefinition.i = chartDefinition.id
  return chartDefinition
}
export default getInstance
