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
  type: 'indexCard',
  root: {
    version: '2023071001',
    contribution: false,
    loading: false,
    // 绕x轴旋转角度
    rotateX: 0,
    // 绕y轴旋转角度
    rotateY: 0,
    // 绕z轴旋转角度
    rotateZ: 0,
    // 透视距离
    perspective: 0,
    skewX: 0,
    skewY: 0
  },
  customize: {
    src: '',
    borderRadius: 0,
    borderWidth: 0,
    fontFamily: 'ds-digitalbold',
    lineDistance: 6,
    borderColor: '',
    gradientDirection: 'to right',
    gradientColor0: '#4391f4',
    gradientColor1: '#67d3fc',
    distance: 30,
    imgSize: 60,
    firstSize: 36,
    firstColor: '#ffffff',
    firstWeight: 500,
    secondSize: 18,
    secondColor: '#ffffff',
    secondWeight: 500,
    secondLine: '已上线数',
    unit: '',
    unitSize: 32,
    unitColor: '#fff'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
