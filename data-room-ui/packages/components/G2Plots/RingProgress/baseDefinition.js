import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'RingProgress',
  chartType: 'RingProgress',
  name: '进度环图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '进度环图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    metricField: 'percent',
    percent: 0.7,
    index: 0,
    radius: 1,
    innerRadius: 0.8,
    color: ['#5B8FF9', '#E8EDF3'],
    progressStyle: {
      fillOpacity: 1
    },
    statistic: {
      title: {
        offsetY: -4,
        style: {
          fontSize: 32,
          color: '',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        content: '进度'
      },
      content: {
        offsetY: 12,
        style: {
          fontSize: 28,
          color: '',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }
    }
  }
}
