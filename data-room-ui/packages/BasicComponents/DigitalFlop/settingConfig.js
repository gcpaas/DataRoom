import { commonConfig, displayOption } from 'data-room-ui/js/config'

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
    version: '2023071001',
    contribution: false,
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
    color: '#fff',
    bgColor: '#007aff',
    fontSize: 100,
    width: 100,
    borderRadius: 0,
    borderColor: '',
    borderWidth: 1,
    formatter: 3,
    fontWeight: 500,
    slotLeft: '',
    slotRight: '',
    marginRight: 20,
    numberDigits: 5,
    placeHolder: '0',
    height: 125,
    fontFamily: 'ds-digitalbold',
    lineStyle: {
      height: 4,
      color: '#000000'
    }
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
