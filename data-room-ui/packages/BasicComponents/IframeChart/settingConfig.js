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
    version: '2023071001',
    url: 'http://gcpaas.gccloud.com',
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
  customize: {
    fontSize: 20,
    fontWeight: 700,
    color: '#36474f'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
