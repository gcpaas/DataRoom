import baseDefinition from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/baseDefinition'
/**
 * 根据图表配置生成对应的实例，用于初始化
 */
function getInstance () {
  const chartDefinition = {
    ...baseDefinition,
    type: 'BaseColumn',
    option: {
      ...baseDefinition.option,
      color: ['rgba(1, 238, 255, 1)']
    },
    w: 450, // 宽度
    h: 320 // 高度
  }
  // 每个组件实现自己的初始化逻辑
  return chartDefinition
}
export default getInstance
