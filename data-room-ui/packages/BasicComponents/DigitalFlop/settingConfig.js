import { commonConfig, displayOption } from 'packages/js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  data: [],
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    params: {
      enable: false
    },
    headerField: {
      enable: false
    },
    metricField: {
      // 指标
      label: '指标',
      enable: false,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 表格列
      label: '展示字段', // 维度/查询字段
      enable: true,
      multiple: false // 是否多选
    }
  }
}
const customConfig = {
  type: 'digitalFlop',
  root: {
    contribution: false
  },
  customize: {
    color: '#fff',
    bgColor: '#007aff',
    fontSize: 100,
    width: 100,
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: 1,
    formatter: 3,
    fontWeight: 500,
    slotLeft: '',
    slotRight: '',
    marginRight: 20,
    numberDigits: 5,
    placeHolder: '0'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
