/*
 * @description: 图片组件配置
 * @Date: 2023-03-17 11:17:00
 * @Author: xing.heng
 */
import { commonConfig } from '../../js/config'

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
  type: 'picture',
  customize: {
    url: '',
    radius: 0,
    opacity: 100
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
