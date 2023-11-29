import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  header: [],
  columnWidth: [],
  align: [],
  data: [],
  origData:[],
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
