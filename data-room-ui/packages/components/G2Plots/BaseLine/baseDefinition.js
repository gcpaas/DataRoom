
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'BaseLine',
  chartType: 'Line',
  name: '基础折线图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '基础折线图'
  },
  // 图表的基础配置，配置格式与G2plot、EChart官网保持一致
  option: {
    // 图表内边距
    appendPadding: [0, 0, 0, 0],
    data: [],
    color: '',
    xField: 'date',
    yField: 'value',
    dimensionField: 'xField',
    metricField: 'yField',
    smooth: false,
    yFieldAlias: '',
    meta: {},
    lineStyle: {
      lineWidth: 2,
      stroke: 'l(0) 0:rgba(1, 238, 255, 1) 1:'
    },
    label: {
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
    point: {
      size: 3,
      shape: 'diamond',
      style: {
        fill: '#000',
        stroke: '#000',
        lineWidth: 2
      }
    },
    tooltip: { showMarkers: false },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red'
        }
      }
    },
    xAxis: {
      title: {
        text: '',
        position: 'center',
        style: {
          fill: 'rgba(140, 140, 140, 1)',
          fontSize: 12
        }
      },
      label: {
        // 可使用函数 (isVertical: boolean, labelGroup: IGroup, limitLength?: number) => boolean;
        autoRotate: false,
        autoHide: false,
        autoEllipsis: true,
        // autoHide的类型详见@antv/component/src/axis/overlap/auto-hide.ts
        autoHideEnable: true,
        autoHideMinGap: 2,
        style: {
          fill: 'rgba(140, 140, 140, 1)',
          fontSize: 10
        }
      },
      line: {
        style: {
          stroke: 'rgba(208, 208, 208, 1)',
          lineWidth: 1
        }
      },
      tickLine: {
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
          fontSize: 12
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
      line: {
        style: {
          stroke: '#000',
          lineWidth: 0
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
      }
    }
  }

}
