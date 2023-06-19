import { commonConfig, displayOption } from 'packages/js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  header: [],
  columnWidth: [],
  align: [],
  data: [],
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    headerField: {
      enable: true
    },
    metricField: {
      // 指标
      label: '指标',
      enable: false,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 表格列
      label: '表格列', // 维度/查询字段
      enable: true,
      multiple: true // 是否多选
    }
  }
}
const customConfig = {
  type: 'screenScrollBoard',
  root: {
    contribution: false
  },
  customize: {
    rowNum: 5,
    headerBGC: '#007aff',
    oddRowBGC: '',
    evenRowBGC: '',
    waitTime: 2000,
    headerHeight: 35,
    index: false,
    indexHeader: '#',
    carousel: 'single',
    hoverPause: true,
    columnConfig: []
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
