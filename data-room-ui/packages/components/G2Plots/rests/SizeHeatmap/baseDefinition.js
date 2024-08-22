
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'SizeHeatmap',
  chartType: 'Heatmap',
  name: '热力形状(大小映射)图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '热力形状(大小映射)图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    xField: 'name',
    yField: 'country',
    dimensionField: 'xField',
    metricField: 'yField',
    colorField: 'value',
    sizeField: 'value',
    classifiedField: 'colorField',
    seriesField: 'sizeField',
    shape: 'square',
    // sizeRatio: 0.5,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle', // 'top', 'bottom', 'middle',
      // 偏移量
      offsetX: 0,
      offsetY: 0,
      // 配置样式
      style: {
        fill: '#fff',
        opacity: 1,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0,
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)'
      }
    },
    heatmapStyle: {
      stroke: 'yellow',
      lineWidth: 2,
      opacity: 0
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
    }
  }
}
