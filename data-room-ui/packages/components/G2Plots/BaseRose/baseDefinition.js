import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成

export default {
  ...baseDefinition,

  // 每个组件自定义各自的属性
  type: 'BaseRose',
  chartType: 'Rose',
  name: '玫瑰图',
  title: {
    enable: true,
    text: '玫瑰图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    yField: 'value',
    xField: 'type',
    seriesField: 'type',
    dimensionField: 'xField',
    metricField: 'yField',
    radius: 0.9,
    color: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'], // 常用的六种配色方案
    label: {
      offset: 15,
      style: {
        opacity: 0,
        fontWeight: 'lighter',
        fontFamily: '',
        fontSize: 12
      }
    },
    showLegend: false,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
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
