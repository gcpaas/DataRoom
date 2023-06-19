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
  type: 'border14',
  customize: {
    // 边框线颜色
    borderColor: '#87888e',
    // 边框线宽度
    borderWidth: 2,
    // 边框背景颜色
    backgroundColor: '#232832',
    colorType: 'single',
    // 渐变色0值
    gradientColor0: '#83bff6',
    // 渐变色1值
    gradientColor1: '#188df0',
    // 渐变色色值改变方向
    gradientDirection: 'to right',
    // 透明度
    opacity: 100,
    // 左上圆角
    radiusLeftTop: 2,
    // 右上圆角
    radiusRightTop: 2,
    // 左下圆角
    radiusLeftBottom: 2,
    // 右下圆角
    radiusRightBottom: 2
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
