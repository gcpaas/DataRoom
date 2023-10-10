import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  header: [],
  columnWidth: [],
  align: [],
  data: 0,
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
  type: 'indicatorCard',
  root: {
    version: '2023071001',
    contribution: false,
    loading: false
  },
  customize: {
    borderRadius: 0,
    borderWidth: 0,
    lineDistance: 25,
    borderColor: '',
    bgColor: 'rgba(0, 122, 255, 1)',
    firstSize: 50,
    firstColor: '#ffffff',
    firstWeight: 500,
    secondSize: 32,
    secondColor: '#ffffff',
    secondWeight: 500,
    secondLine: '装机处理及时率',
    unit: '',
    unitSize: 32,
    unitColor:'#fff'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
