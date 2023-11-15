import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  padding: [30, 30, 50, 80],
  legend: false,
  isGroup: true,
  data: [],
  color: '',
  theme: 'dark',
  label: {
    // 可手动配置 label 数据标签位置
    position: 'top', // 'top', 'bottom', 'middle',
    // 配置样式
    content: ''
  },
  seriesField: '', // 分组
  displayOption: {
    ...displayOption,
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
  type: 'tables',
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
    theme: 'dark', // 'light'、'dark'
    // 表格头部背景颜色
    headerBackgroundColor: '#232832',
    // 表格头部字体颜色
    headerFontColor: '#fff',
    // 表格头部字体大小
    headerFontSize: 14,
    // 表格主体背景颜色
    bodyBackgroundColor: '',
    // 表格主体字体颜色
    bodyFontColor: 'rgb(155 159 172)',
    // 表格主体字体大小
    bodyFontSize: 14,
    // 表格是否需要斑马纹
    stripe: false,
    // 表格奇数行背景颜色
    oddRowBackgroundColor: '',
    // 表格偶数行背景颜色‘
    evenRowBackgroundColor: ''
    // 表格是否需要边框
    // border: false,
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
