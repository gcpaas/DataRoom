import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'GroupBullet',
  chartType: 'Bullet',
  name: '分组子弹图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '分组子弹图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    measureField: 'measures',
    rangeField: 'ranges',
    targetField: 'target',
    xField: 'title',
    classifiedField: 'xField',
    metricField: 'targetField',
    dimensionField: 'rangeField',
    seriesField: 'measureField',
    layout: 'horizontal',
    color: {
      range: ['#FFbcb8', '#FFe0b0', '#bfeec8'],
      measure: '#5B8FF9',
      target: '#39a3f4'
    },
    size: {
      range: 30,
      measure: 20,
      target: 20
    },
    xAxis: {
      line: null,
      label: {
        offset: 10,
        style: {
          fontSize: 24,
          fill: '#bfc3bf',
          opacity: 1,
          fontWeight: '',
          fontFamily: '',
          stroke: '#FCFC27',
          lineWidth: 0
        }
      },
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
      }
    },
    yAxis: false,
    label: {
      range: {
        position: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          fill: '#fff',
          opacity: 0,
          fontSize: 4,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      },
      measure: {
        position: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          fill: '#fff',
          opacity: 1,
          fontSize: 4,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      },
      target: {
        position: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          fill: '#fff',
          opacity: 1,
          fontSize: 4,
          fontWeight: 'lighter',
          fontFamily: '',
          stroke: '#00FF00',
          lineWidth: 0
        }
      }
    },
    showLegend: false,
    legend: {
      custom: true,
      offsetX: 10,
      offsetY: 10,
      position: 'bottom',
      itemName: {
        style: {
          fill: '#1a1a1a',
          fontSize: 14,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      },
      items: [
        {
          value: '差',
          name: '差',
          marker: { symbol: 'square', style: { fill: '#FFbcb8', r: 5 } }
        },
        {
          value: '良',
          name: '良',
          marker: { symbol: 'square', style: { fill: '#FFe0b0', r: 5 } }
        },
        {
          value: '优',
          name: '优',
          marker: { symbol: 'square', style: { fill: '#bfeec8', r: 5 } }
        },
        {
          value: '实际值',
          name: '实际值',
          marker: { symbol: 'square', style: { fill: '#5B8FF9', r: 5 } }
        },
        {
          value: '目标值',
          name: '目标值',
          marker: { symbol: 'line', style: { stroke: '#39a3f4', r: 5 } }
        }
      ]
    }
  }
}
