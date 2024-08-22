
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'PolarHeatmap',
  chartType: 'Heatmap',
  name: '极坐标色块图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '极坐标色块图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    xField: 'time',
    yField: 'week',
    dimensionField: 'xField',
    metricField: 'yField',
    colorField: 'value',
    classifiedField: 'colorField',
    color: '#BAE7FF-#1890FF-#1028ff',
    showLegend: true,
    coordinate: {
      // 坐标轴属性配置
      type: 'polar', // 极坐标
      cfg: {
        radius: 1,
        innerRadius: 0.2
      }
    },
    label: {
      position: 'middle',
      // 偏移量
      offsetX: 0,
      offsetY: 0,
      // 配置样式
      style: {
        fill: '#fff',
        opacity: 0,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0,
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)'
      }
    },
    meta: {
      time: {
        type: 'cat'
      },
      value: {
        min: 0,
        max: 1
      }
    },
    heatmapStyle: {
      stroke: '#f5f5f5',
      lineWidth: 0,
      opacity: 1
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
        offset: 12,
        style: {
          fill: '#666',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          textBaseline: 'top',
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
            lineWidth: 1,
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
      grid: null,
      tickLine: null,
      label: {
        offset: 0,
        style: {
          fill: '#fff',
          fontSize: 12,
          fontWeight: 'lighter',
          fontFamily: '',
          textAlign: 'center',
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, .45)',
          opacity: 1
        }
      },
      line: null,
      top: true
    },
    tooltip: {
      showMarkers: false
    },
    interactions: [{ type: 'element-active' }]
  }
}
