import { commonConfig, displayOption } from 'data-room-ui/js/config'

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
    version: '2023071001',
    contribution: false,
    loading: false,
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
    waitTime: 2000,
    carousel: 'single',
    unit: '',
    sort: true,
    valueFormatter: undefined,
    rankFontSize: 13,
    rankColor: '#1370fb',
    infoNameFontSize: 13,
    infoNameColor: '#ffffff',
    rankingValueFontSize: 13,
    rankingValueColor: '#fff',
    insideColumnColor: '#1370fb',
    rankingColumnBorderBottomColor: '#1370fb',
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
