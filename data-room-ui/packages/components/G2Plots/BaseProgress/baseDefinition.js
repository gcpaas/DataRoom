import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseProgress',
  chartType: 'Progress',
  name: '进度条', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '进度条'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    metricField: 'percent',
    percent: 0.75,
    index: 0,
    barWidthRatio: 0.5,
    color: ['#5B8FF9', '#E8EDF3'],
    progressStyle: {
      fillOpacity: 1
    }
  }
}
