import { commonConfig, displayOption } from 'packages/js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  data: [],
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    metricField: {
      // 指标
      label: '指标',
      enable: true,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 表格列
      label: '维度', // 维度/查询字段
      enable: true,
      multiple: false // 是否多选
    }
  }
}
const customConfig = {
  type: 'screenScrollRanking',
  root: {
    contribution: false
  },
  customize: {
    rowNum: 5,
    waitTime: 2000,
    carousel: 'single',
    unit: '',
    sort: true,
    valueFormatter: undefined
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
