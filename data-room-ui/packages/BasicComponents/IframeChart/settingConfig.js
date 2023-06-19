/*
 * @description: 外链配置
 * @Date: 2022-09-01 15:26:34
 * @Author: xingheng
 */

import { commonConfig } from '../../js/config'

export const settingConfig = {
  theme: 'dark',
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
  type: 'iframeChart',
  root: {
    url: 'https://www.runoob.com/'
  },
  customize: {
    fontSize: 20,
    fontWeight: 700,
    color: '#36474f'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
