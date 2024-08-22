import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'CompareFunnel',
  chartType: 'Funnel',
  name: '对比漏斗图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '对比漏斗图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    xField: 'stage',
    yField: 'number',
    compareField: 'company',
    dimensionField: 'xField',
    metricField: 'yField',
    classifiedField: 'compareField',
    isTransposed: false,
    minSize: 0,
    maxSize: 1,
    color: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'],
    label: {
      position: 'middle',
      offsetX: 0,
      offsetY: 0,
      // 配置样式
      style: {
        fill: 'rgba(255, 255, 255, 1)',
        opacity: 1,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0
      }
    },
    funnelStyle: {
      stroke: '#f6f3f3',
      lineWidth: 4,
      lineDash: [5, 0],
      strokeOpacity: 0.7,
      cursor: 'pointer'
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
    conversionTag: {
      offsetX: 0,
      offsetY: 0,
      style: {
        fill: 'rgb(182,182,182)',
        opacity: 1,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0
      }
    }
  }
}
