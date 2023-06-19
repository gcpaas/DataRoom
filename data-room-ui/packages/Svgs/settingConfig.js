import { commonConfig } from 'packages/js/config'
export const settingConfig = {
  // 设置面板属性的显隐
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
