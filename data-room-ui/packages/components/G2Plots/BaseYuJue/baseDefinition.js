import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成

export default {
  ...baseDefinition,

  // 每个组件自定义各自的属性
  type: 'BaseYuJue',
  chartType: 'RadialBar',
  name: '基础玉珏图',
  title: {
    enable: true,
    text: '基础玉珏图'
  },
  option: {
    appendPadding: [10, 10, 10, 10],
    xField: 'name',
    yField: 'star',
    dimensionField: 'xField',
    metricField: 'yField',
    colorField: 'name',
    maxAngle: 270,
    minBarWidth: 10,
    maxBarWidth: 100,
    radius: 0.8,
    innerRadius: 0.2,
    color: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
    barStyle: {
      lineCap: ''
    },
    type: '',
    tooltip: {
      formatter: (datum) => {
        return { name: 'star数', value: datum.star }
      }
    },
    label: {
      style: {
        fontSize: 14,
        textAlign: 'center',
        fill: 'black',
        opacity: 0,
        fontWeight: 'lighter',
        fontFamily: ''
      }
    },
    xAxis: {
      label: {
        autoHide: true,
        autoEllipsis: true,
        autoHideEnable: true,
        autoHideMinGap: 2,
        style: {
          fill: '#9A9797',
          fontSize: 16,
          fontWeight: 'lighter',
          fontFamily: '',
          opacity: 1
        }
      }
    }
  }
}
