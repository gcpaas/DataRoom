
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
    version: '2023092101'
  },
  // 自定义属性
  customize: {
    value: '',
    // 选择框背景颜色
    bgColor: '#35393F',
    // 选择框文字颜色
    fontColor: '#FFFFFF',
    // 选择框文字大小
    fontSize: 20,
    // 显示类型 year/month/date/week/ datetime/datetimerange/daterange
    type: 'datetime',
    // 时间格式化类型:Date 对象（default），时间戳（timestamp），自定义（custom）
    formatType: 'default',
    // 绑定值的格式
    valueFormat: '',
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
