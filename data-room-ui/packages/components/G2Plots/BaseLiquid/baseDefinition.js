
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseLiquid',
  chartType: 'Liquid',
  name: '水波图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '水波图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    metricField: 'percent',
    percent: 0.25,
    shape: 'circle',
    outline: {
      border: 4,
      color: '#6388df',
      distance: 8
    },
    liquidStyle: {
      fill: '#6388df',
      cursor: 'pointer'
    },
    wave: {
      count: 3,
      length: 128
    },
    statistic: {
      title: {
        offsetY: 0,
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
          fill: '#353333',
          fontSize: 36,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      }
    },
    pattern: {
      type: 'dot',
      cfg: {
        size: 4,
        padding: 4,
        fill: '#FFF',
        rotation: 10,
        fillOpacity: 0,
        isStagger: true
      }
    }
  }
}
