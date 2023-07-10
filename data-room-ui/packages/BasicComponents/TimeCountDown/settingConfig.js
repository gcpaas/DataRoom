import { commonConfig } from '../../js/config'

export const settingConfig = {
  time: '',
  theme: 'dark',
  // 设置面板属性的显隐
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
  type: 'timeCountDown',
  root: {
    version : '0.0.1',
    endTime: ''
  },
  customize: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
