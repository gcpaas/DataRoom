import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成
export default {
  ...baseDefinition,

  // 每个组件自定义各自的属性
  type: 'WordCloud',
  chartType: 'WordCloud',
  name: '词云',
  title: {
    enable: true,
    text: '词云'
  },
  option: {
    appendPadding: [10, 10, 10, 10],
    wordField: 'x',
    weightField: 'value',
    colorField: 'x',
    dimensionField: 'wordField',
    metricField: 'weightField',
    classifiedField: 'colorField',
    imageMask: '',
    color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    wordStyle: {
      padding: 1,
      fontFamily: 'Verdana',
      fontWeight: 'lighter',
      fontSize: [24, 80],
      rotation: [0, 90],
      rotationSteps: 2
    },
    // 设置交互类型
    interactions: [{ type: 'element-active' }],
    state: {
      active: {
        // 这里可以设置 active 时的样式
        style: {
          stroke: '#000000',
          lineWidth: 3,
          cursor: 'pointer'
        }
      }
    }
  }
}
