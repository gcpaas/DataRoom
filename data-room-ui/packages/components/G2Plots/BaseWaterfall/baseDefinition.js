
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseWaterfall',
  chartType: 'Waterfall',
  name: '基础瀑布图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '基础瀑布图'
  },
  option: {
    appendPadding: [15, 0, 0, 0],
    columnWidthRatio: 0.5,
    xField: 'type',
    yField: 'money',
    dimensionField: 'xField',
    metricField: 'yField',
    /** 展示总计 */
    total: {
      label: '总计',
      style: {
        fill: '#96a6a6'
      }
    },
    meta: {
      type: {
        alias: '类别'
      },
      money: {
        alias: '收支',
        formatter: (v) => `${v} 元`
      }
    },
    leaderLine: {
      style: {
        lineWidth: 1,
        stroke: '#8c8c8c',
        lineDash: [4, 2],
        opacity: 1
      }
    },
    risingFill: '#e66d47',
    fallingFill: '#3fb862',
    waterfallStyle: {
      stroke: '#f6f3f3',
      lineWidth: 2,
      lineDash: [5, 0],
      strokeOpacity: 0.7,
      cursor: 'pointer'
    },
    labelMode: 'difference',
    label: {
      position: 'middle',
      offsetX: 0,
      offsetY: 0,
      layout: [{ type: 'interval-adjust-position' }],
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
    xAxis: {
      title: {
        text: '',
        rotation: 180,
        offset: 30,
        position: 'center',
        style: {
          fill: 'rgba(140, 140, 140, 1)',
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
        rotation: 30,
        offset: 10,
        // position: 'left',
        style: {
          fill: 'rgba(140, 140, 140, 1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      },
      line: {
        style: {
          stroke: 'rgba(208, 208, 208, 1)',
          lineWidth: 1
        }
      },
      tickLine: {
        length: 4,
        style: {
          stroke: 'rgba(208, 208, 208, 1)',
          lineWidth: 1
        }
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(208, 208, 208, 1)',
            lineWidth: 0,
            lineDash: [4, 0],
            strokeOpacity: 0.7
          }
        }
      }
    },
    yAxis: {
      title: {
        text: '',
        position: 'end',
        autoRotate: false,
        // rotation: Math.PI / 2,
        style: {
          fill: 'rgba(140, 140, 140, 1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(208, 208, 208, 1)',
            lineWidth: 1,
            lineDash: [4, 0],
            strokeOpacity: 0.7
          }
        }
      },
      tickLine: {
        length: 4,
        style: {
          stroke: 'rgba(208, 208, 208, 1)',
          lineWidth: 1
        }
      },
      label: {
        style: {
          fill: 'rgba(140, 140, 140, 1)',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      },
      line: {
        style: {
          stroke: 'rgba(208, 208, 208, 1)',
          lineWidth: 0
        }
      }
    },
    showLegend: true,
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
