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
  type: 'video',
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
    videoType: 'application/x-mpegURL',
    videoUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    posterUrl: ''
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
