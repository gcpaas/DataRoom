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
  type: 'indexCard2',
  root: {
    version: '2023071001',
    contribution: false,
    loading: false
  },
  customize: {
    src: 'http://60.174.249.206:11080/upload/webDesign/uiSucai/dir/icon/icon_top6.png',
    borderRadius: 0,
    borderWidth: 0,
    lineDistance: 25,
    borderColor: '',
    bgColor: '',
    distance: 30,
    imgSize: 110,
    firstSize: 50,
    firstColor: '#ffffff',
    firstWeight: 500,
    secondSize: 50,
    secondColor: '#ffffff',
    secondWeight: 500,
    secondLine: '装机处理及时率'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
