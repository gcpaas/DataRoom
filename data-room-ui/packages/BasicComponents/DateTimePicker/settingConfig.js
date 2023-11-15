
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  // text内容
  text: '时间选择器',
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    dataAllocation: { enable: true },
    dataSourceType: { enable: false },
    params: { enable: false }
  }
}

const customConfig = {
  type: 'dateTimePicker',
  // 名称
  title: '日期时间选择器',
  root: {
    version: '2023092101',
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
    // 选择框背景颜色
    bgColor: '#00000000',
    // 选择框文字颜色
    fontColor: '#FFFFFF',
    // 选择框字体大小
    fontSize: 14,
    // 显示类型 year/month/date/ datetime/datetimerange/daterange
    type: 'datetimerange',
    // 时间格式化类型:时间戳（timestamp），自定义（custom）
    formatType: 'custom',
    format: 'yyyy-MM-dd HH:mm:ss',
    // 时间数据格式
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    // 下拉框
    dropDownBox: {
      // 下拉框背景颜色
      bgColor: '#35393F',
      // 下拉框输入框背景颜色
      inputBgColor: '#2C3036',
      // 下拉框字体颜色
      fontColor: '#FFFFFF',
      // 下拉项hover背景颜色
      hoverBgColor: '#6A7E9D',
      // 下拉项hover字体颜色
      hoverFontColor: '#FFFFFF',
      // 下拉项激活文字颜色
      selectedFontColor: '#00BFFF',
      // 范围时间选择器选中范围颜色
      rangeBgColor: '#409EFF'
    }
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
