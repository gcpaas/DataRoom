
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  // text内容
  text: '选择器',
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    dimensionField: {
      // 维度
      label: '选项的标签', // 维度/查询字段
      enable: true,
      multiple: false // 是否多选
    },
    metricField: {
      // 指标
      label: '绑定值',
      enable: true,
      multiple: false // 是否多选
    }
  }
}

const customConfig = {
  type: 'select',
  // 名称
  root: {
    version: '2023091402'
  },
  // 自定义属性
  customize: {
    // 输入框背景颜色
    backgroundColor: '#35393F',
    // 输入框字体大小
    fontSize: 20,
    // 输入框字体颜色
    fontColor: '#FFFFFF',
    // 下拉框背景颜色
    dropDownBackgroundColor: '#35393F',
    // 下拉框字体颜色
    dropDownFontColor: '#FFFFFF',
    // 下拉项hover背景颜色
    dropDownHoverBackgroundColor: '#6A7E9D',
    // 下拉项hover字体颜色
    dropDownHoverFontColor: '#FFFFFF'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
