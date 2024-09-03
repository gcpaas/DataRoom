import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseGauge',
  chartType: 'Gauge',
  name: '仪表盘', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '仪表盘'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    metricField: 'percent',
    index: 0,
    percent: 0.75,
    innerRadius: 0.9,
    radius: 1,
    type: '',
    // 自定义 meter 总步数 以及 step 占比
    meter: {
      steps: 50,
      stepRatio: 0.6
    },
    range: {
      ticks: [0, 1],
      width: 35,
      color: 'l(0) 0:rgba(48, 191, 120, 1) 1:rgba(48, 191, 120, 1)'
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
          lineWidth: 1,
          opacity: 1
        }
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
          lineWidth: 1,
          opacity: 1
        }
      }
    },
    statistic: {
      title: {
        offsetY: -160,
        content: '',
        style: {
          fill: '#090000',
          fontSize: 36,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      },
      content: {
        style: {
          color: '#353333',
          fontSize: 60,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      }
    }
  }
}
