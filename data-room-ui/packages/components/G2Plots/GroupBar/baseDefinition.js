
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'GroupBar',
  chartType: 'Column',
  name: '分组柱状图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '分组柱状图'
  },
  // 图表的基础配置，配置格式与G2plot、EChart官网保持一致
  option: {
    isGroup: true,
    data: [],
    // 图表内边距
    appendPadding: [0, 0, 0, 0],
    minColumnWidth: 0,
    maxColumnWidth: 100,
    // 柱子样式
    columnStyle: {
      // 圆角
      radius: [0, 0, 0, 0]
      // fill: 'l(90) 0:#6B74E4 1:#4391F4'
    },
    color: ['rgba(1, 238, 255, 1)', 'rgba(0, 155, 255, 1)', '#38bbe5', '#69d6fd', '#36c6a0'],
    // 背景图设置
    columnBackground: {
      style: {
        fill: 'rgba(255,255,255,0.2)'
      }
    },

    xField: '月份',
    yField: '月均降雨量',
    seriesField: 'name',
    dimensionField: 'xField',
    metricField: 'yField',
    classifiedField: 'seriesField',
    meta: {},
    // color: '#007aff',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle', // 'top', 'bottom', 'middle',
      // 偏移量
      offsetX: 0,
      offsetY: 0,
      // 配置样式
      style: {
        fill: 'rgba(255, 255, 255, 1)',
        opacity: 0,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0
      }
    },
    // pattern: {
    //   type: '',
    //   cfg: {
    //     size: 4,
    //     padding: 4,
    //     rotation: 0,
    //     fill: '#FF0',
    //     isStagger: true,
    //     stroke: 'red',
    //     lineWidth: 0
    //   }
    // },
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
          opacity: 1,
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: ''
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
          fontFamily: ''
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
        formatter: (v) => {
          if (v < 1e3) return v
          // 数值格式化为千分位
          if (v >= 1e3 && v < 1e6) return `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
          if (v >= 1e6 && v < 1e9) return `${(v / 1e6).toFixed(1)} M`
          if (v >= 1e9 && v < 1e12) return `${(v / 1e9).toFixed(1)} B`
          return `${(v / 10e8).toFixed(1)} B`
        },
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
