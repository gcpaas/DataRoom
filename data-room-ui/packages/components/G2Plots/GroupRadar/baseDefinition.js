import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成

export default {
  ...baseDefinition,
  // 每个组件自定义各自的属性
  type: 'GroupRadar',
  chartType: 'Radar',
  name: '分组雷达图',
  title: {
    enable: true,
    text: '分组雷达图'
  },
  option: {
    xField: 'item',
    yField: 'score',
    seriesField: 'user',
    dimensionField: 'xField',
    metricField: 'yField',
    classifiedField: 'seriesField',
    appendPadding: [0, 10, 0, 10],
    color: ['#007BFF', '#28A745', '#FFC107', '#6F42C1', '#0056B3', '#E2999A'],
    smooth: false, // 折线？曲线
    xAxis: {
      line: null,
      tickLine: null,
      label: {
        autoHide: true,
        autoEllipsis: true,
        autoHideEnable: true,
        autoHideMinGap: 2,
        style: {
          fill: 'rgba(140,140,140,1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(140,140,140,1)',
            opacity: 1,
            lineDash: null
          }
        }
      }
    },
    yAxis: {
      label: false,
      min: 0,
      grid: {
        alternateColor: 'rgba(0, 0, 0, 0.04)',
        line: {
          style: {
            stroke: 'rgba(140,140,140,1)'
          }
        }
      }
    },
    label: {
      style: {
        fill: '#757575',
        opacity: 0,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: ''
      }
    },
    // 开启面积
    area: {
      style: {
        fillOpacity: 0.25
      }
    },
    // 开启辅助点
    point: {
      size: 2,
      shape: 'circle',
      style: {
        fill: ''
      }
    },
    showLegend: true,
    // 图例
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
    }
  }
}
