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
  type: 'border1',
  root: {
    contribution: false
  },
  customize: {
    borderMainColor: '#83bff6',
    borderSecondaryColor: '#00CED1',
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
