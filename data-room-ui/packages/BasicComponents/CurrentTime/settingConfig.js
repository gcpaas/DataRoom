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

  type: 'currentTime',
  root: {
    version: '2023071001',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
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
    fontSize: 14,
    fontWeight: 300,
    fontFamily: 'ds-digitalbold', // 字体类型
    color: '#ffffff'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
