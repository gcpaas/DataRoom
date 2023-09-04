/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2022-10-13 11:18:03
 * @LastEditTime: 2022-10-13 13:55:11
 */
import { commonConfig } from 'data-room-ui/js/config'

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
  type: 'themeSwitcher',
  root: {
    version: '2023071001'
  },
  customize: {
    activeColor: '#007aff', // 单选框字体激活状态
    inactiveColor: '#bcc9d4'// 单选框字体非激活状态
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
