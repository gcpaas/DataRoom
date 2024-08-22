import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成
export default {
  ...baseDefinition,
  // 每个组件自定义各自的属性
  type: 'BaseSankey',
  chartType: 'Sankey',
  name: '基础桑基图',
  title: {
    enable: true,
    text: '基础桑基图'
  },
  option: {
    appendPadding: [20, 50, 20, 20],
    sourceField: 'source',
    targetField: 'target',
    weightField: 'value',
    dimensionField: 'sourceField',
    metricField: 'targetField',
    classifiedField: 'weightField',
    nodeWidthRatio: 0.008,
    nodePaddingRatio: 0.03,
    // color: ['#FF6384', '#36A2EB', '#FFCE56', '#008000', '#800080', '#FFA500'],
    edgeStyle: {
      fillOpacity: 0.4
    },
    nodeState: {
      active: {
        style: {
          lineDash: [5, 0],
          lineWidth: 3,
          stroke: 'rgba(170, 170, 170, 1)'
        }
      }
    },
    tooltip: {
      showTitle: true
    }
  }
}
