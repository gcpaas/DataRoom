// import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// // 打包自动生成
// const version = '5c7a46df7973ea21d162e7f42e3c024b'
// export default {
//   ...baseDefinition,
//   version: version,
//   // 每个组件自定义各自的属性
//   type: 'BasePie',
//   title: '基础饼图',
//   color: '#000',
//   disabled: true
// }
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成

export default {
  ...baseDefinition,

  // 每个组件自定义各自的属性
  type: 'BasePie',
  chartType: 'Pie',
  name: '基础饼图',
  title: {
    enable: true,
    text: '基础饼图'
  },
  option: {
    appendPadding: [10, 10, 10, 10],
    angleField: 'value',
    colorField: 'type',
    dimensionField: 'colorField',
    metricField: 'angleField',
    radius: 0.9,
    color: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'], // 常用的六种配色方案
    label: {
      type: 'inner',
      offset: '-30%',
      autoRotate: false,
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
        fill: 'black',
        opacity: 0,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#FCFC27',
        lineWidth: 0
      },
      labelLine: {
        style: {
          stroke: '#1EFF00',
          lineWidth: 6,
          opacity: 0.6
        }
      }
    },
    showLegend: false,
    legend: {
      layout: 'horizontal',
      position: 'top',
      offsetX: 10,
      offsetY: 10,
      itemSpacing: 20,
      maxWidth: 300,
      flipPage: true,
      maxRow: 2,
      rail: {
        type: 'color',
        size: 10,
        defaultLength: 100
      },
      itemName: {
        style: {
          fill: '#1a1a1a',
          fontSize: 14,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      },
      pageNavigator: {
        marker: {
          style: {
            // 非激活，不可点击态时的填充色设置
            inactiveFill: '#000',
            inactiveOpacity: 0.45,
            // 默认填充色设置
            fill: '#000',
            opacity: 0.8,
            size: 12
          }
        },
        text: {
          style: {
            fill: '#ccc',
            fontSize: 8,
            fontWeight: 'lighter',
            fontFamily: ''
          }
        }
      },
      // 标记
      marker: {
        symbol: 'circle',
        style: {
        }
      }
    },
    interactions: [{ type: 'element-active' }]
  }
}
