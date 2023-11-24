/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2022-10-13 11:18:03
 * @LastEditTime: 2022-10-13 13:55:11
 */
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  theme: 'dark',
  text: '跑马灯占位符', // text内容
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    metricField: {
      // 指标
      label: '音频链接',
      enable: true,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 维度
      label: '跑马灯内容', // 维度/查询字段
      enable: true,
      multiple: false // 是否多选
    }
  }
}
const dataHandler = 'data = data[0]'
const customConfig = {
  type: 'marquee',
  root: {
    version: '2023071001',
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
    title: 'DataRoom由GCPAAS开源社区开源',
    fontSize: 14,
    fontWeight: 700,
    icon: {
      name: '',
      position: 'left',
      color: '#fff'
    },
    // 文字颜色类型: 纯色、渐变
    textColorType: 'pure',
    // 文字颜色
    textColor: '#fff',
    // 文字渐变开始颜色
    textGradientColor0: '#fff',
    // 文字渐变结束颜色
    textGradientColor1: '#fff',
    // 文字渐变方向
    textGradientDirection: 'to right',
    // 滚动方向
    direction: 'right',
    // 滚动间隔
    dur: '8',
    // 背景色类型：纯色、渐变、透明
    backgroundColorType: 'transparent',
    // 背景色
    backgroundColor: '#fff',
    // 背景渐变色开始颜色
    bgGradientColor0: '#fff',
    // 背景渐变色结束颜色
    bgGradientColor1: '#fff',
    // 背景色渐变方向
    bgGradientDirection: 'to right',
    // 语音播报
    voiceBroadcast: false
  }

}

// 配置处理脚本

export const dataConfig = {
  ...commonConfig(customConfig),
  dataHandler
}
