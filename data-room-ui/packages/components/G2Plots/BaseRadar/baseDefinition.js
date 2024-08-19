import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成

export default {
  ...baseDefinition,
  // 每个组件自定义各自的属性
  type: 'BaseRadar',
  chartType: 'Radar',
  name: '基础雷达图',
  title: {
    enable: true,
    text: '基础雷达图'
  },
  option: {
    xField: 'name',
    yField: 'star',
    dimensionField: 'xField',
    metricField: 'yField',
    appendPadding: [0, 10, 0, 10],
    color: 'l(90) 0:rgba(0, 100, 255, 1) 1:rgba(0, 100, 255, 1)',
    meta: {
      star: {
        alias: 'star 数量',
        min: 0,
        nice: true,
        formatter: (v) => Number(v).toFixed(2)
      }
    },
    smooth: false, // 折线？曲线
    xAxis: {
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
            opacity: 1
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
    }
  }
}
