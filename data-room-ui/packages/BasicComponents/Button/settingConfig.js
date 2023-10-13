
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  legend: false,
  isGroup: true,
  data: [],
  label: {
    // 可手动配置 label 数据标签位置
    position: 'top', // 'top', 'bottom', 'middle',
    // 配置样式
    content: ''
  },
  seriesField: '', // 分组
  displayOption: {
    ...displayOption,
    dataAllocation: { enable: true },
    dataSourceType: { enable: false },
    params: { enable: false },
    metricField: {
      // 指标
      label: '指标',
      enable: false,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 表格列
      label: '表格列', // 维度/查询字段
      enable: false,
      multiple: true // 是否多选
    }
  }
}

const customConfig = {
  type: 'button',
  // 名称
  title: '查询',
  root: {
    version: '2023071001',
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
  // 自定义属性
  customize: {
    bindComponents: [],
    // 类型
    // type: 'primary',
    // 背景颜色
    backgroundColor: '#409EFF',
    // 字体颜色
    fontColor: '#fff',
    // 字体大小
    fontSize: 14,
    // 图标
    icon: {
      // 图标名称
      name: '',
      // 位置
      position: ''
    },
    borderStyle: {
      // 边框颜色
      borderColor: '#409EFF',
      // 边框宽度
      borderWidth: 1,
      // 边框样式
      borderStyle: 'solid',
      // 边框圆角
      borderRadius: 4
    }
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
