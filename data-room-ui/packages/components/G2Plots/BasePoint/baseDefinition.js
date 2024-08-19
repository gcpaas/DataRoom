import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成
export default {
  ...baseDefinition,
  // 每个组件自定义各自的属性
  type: 'BasePoint',

  chartType: 'Scatter',
  name: '基础散点图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '基础散点图'
  },
  option: {
    xField: 'Revenue (Millions)',
    yField: 'Rating',
    dimensionField: 'xField',
    metricField: 'yField',
    shape: 'circle',
    colorField: 'Genre',
    seriesField: 'colorField',
    size: 4,
    // 图表内边距
    appendPadding: [
      10,
      10,
      10,
      10
    ],
    color: ['#ff5733', '#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#e91e63'],
    pointStyle: { // 点样式
      // fill: 'red',
      stroke: '',
      lineWidth: 0,
      lineDash: [
        3,
        0
      ]
    },
    label: { // 标签样式设置
      offsetX: 0,
      offsetY: 0,
      rotate: 0,
      // 配置样式
      style: {
        fill: 'rgba(255,255,1)',
        opacity: 0,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0
      }
    },
    xAxis: {
      min: -100,
      tickCount: 10, // 轴刻度线展示个数，（等同于轴标签个数）
      title: {
        text: '',
        rotation: 180,
        offset: 30,
        position: 'center',
        rotate: 0,
        style: {
          fill: 'rgba(140,140,140,1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      },
      label: {
        autoRotate: false,
        autoHide: true,
        autoEllipsis: true,
        autoHideEnable: true,
        autoHideMinGap: 2,
        rotate: 0,
        rotation: 30,
        offset: 10,
        style: {
          fill: 'rgba(140,140,140,1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      },
      line: {
        style: {
          stroke: '#aaa',
          lineWidth: 1,
          lineDash: [0, 0]
        }
      },
      tickLine: {
        length: 4,
        style: {
          stroke: 'rgba(208,208,208,1)',
          lineWidth: 1
        }
      },
      grid: {
        line: {
          style: {
            stroke: '#eee',
            lineWidth: 1,
            lineDash: [
              4,
              0
            ],
            strokeOpacity: 0.7
          }
        }
      }
    },
    yAxis: {
      nice: true,
      title: {
        text: '',
        position: 'end',
        autoRotate: false,
        rotate: 0,
        style: {
          fill: 'rgba(140,140,140,1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      },
      line: {
        style: {
          stroke: '#aaa',
          lineWidth: 1,
          lineDash: [0, 0]
        }
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(208,208,208,1)',
            lineWidth: 1,
            lineDash: [
              4,
              0
            ],
            strokeOpacity: 0.7
          }
        }
      },
      tickLine: {
        length: 4,
        style: {
          stroke: 'rgba(208,208,208,1)',
          lineWidth: 1
        }
      },
      label: {
        autoRotate: false,
        autoHide: true,
        autoEllipsis: true,
        autoHideEnable: true,
        autoHideMinGap: 2,
        rotate: 0,
        rotation: 30,
        offset: 10,
        style: {
          fill: 'rgba(140,140,140,1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      },
      style: {
        fill: 'rgba(140,140,140,1)',
        fontSize: 12,
        fontWeight: 'lighter',
        fontFamily: '',
        opacity: 1
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
        style: {}
      }
    }
  }
}
