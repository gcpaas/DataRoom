
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseBar',
  chartType: 'Column',
  name: '基础柱状图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '基础柱状图'
  },
  // transform: 'perspective(none) translate(255px, 225px) skew(8deg, 7deg) rotateX(34deg) rotateY(13deg) rotateZ(0deg)',
  // 图表的基础配置，配置格式与G2plot、EChart官网保持一致
  option: {
    // data: []//data不在配置中保存,
    // 图表内边距
    appendPadding: [0, 0, 0, 0],
    minColumnWidth: 0,
    maxColumnWidth: 100,
    // 柱子样式
    columnStyle: {
      // 圆角
      radius: [0, 0, 0, 0],
      fill: 'l(90) 0:rgba(0, 155, 255, 1) 1:rgba(0, 155, 255, 0.1)'
    },
    // 背景图设置
    columnBackground: {
      style: {
        fill: 'rgba(255,255,255,0.2)'
      }
    },
    xField: 'date',
    yField: 'value',
    dimensionField: 'xField',
    metricField: 'yField',
    yFieldAlias: '',
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
    }
  }
}
