import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成
export default {
  ...baseDefinition,
  // 每个组件自定义各自的属性
  type: 'BaseArea',
  chartType: 'Area',
  name: '基础区域图',
  title: { // 标题
    enable: true,
    text: '基础区域图'
  },
  // 图表的基础配置，配置格式与G2plot、EChart官网保持一致
  option: {
    xField: 'timePeriod',
    yField: 'value',
    dimensionField: 'xField',
    metricField: 'yField',
    startOnZero: true,
    // 图表内边距
    appendPadding: [
      0,
      0,
      0,
      0
    ],
    lineType: '', // 折线样式（额外属性，通过它来决定smooth和stepType
    smooth: false, // 折线？曲线
    stepType: '', // 阶梯
    line: {
      size: 4,
      color: 'l(0) 0:rgba(0, 98, 255, 0.49) 1:rgba(0, 98, 255, 0.49)'
    },
    point: { // 点样式
      size: 2,
      shape: 'diamond',
      style: {
        fill: 'red',
        stroke: '#5B8FF9',
        lineWidth: 2,
        lineDash: [
          3,
          0
        ]
      }
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
      range: [0, 1],
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
          stroke: 'rgba(208,208,208,1)',
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
            stroke: 'rgba(208,208,208,1)',
            lineWidth: 0,
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
          stroke: 'rgba(208,208,208,1)',
          lineWidth: 0,
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
    areaStyle: {
      fill: 'l(0) 0:rgba(135, 206, 250, 1) 1:rgba(135, 206, 250, 1)',
      fillOpacity: 0.15,
      lineWidth: 4
      // stroke: 'red'
    }
  }
}
