import { commonConfig } from '../../js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  data: [],
  // displayOption: {
  //   color: '',
  //   backgroundColor: ''
  // }
  // 设置面板属性的显隐
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
  type: 'border13',
  root: {
    contribution: false
  },
  customize: {
    // 边框主要颜色
    borderMainColor: '#83bff6',
    // 边框次要颜色
    borderSecondaryColor: '#00CED1',
    // 边框背景颜色
    backgroundColor: '',
    colorType: 'single',
    // 渐变色0值
    gradientColor0: '#83bff6',
    // 渐变色1值
    gradientColor1: '#188df0',
    // 渐变色色值改变方向
    gradientDirection: 'to right',
    // 透明度
    opacity: 100
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
