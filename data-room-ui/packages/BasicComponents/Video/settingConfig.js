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
  customize: {
    videoType: 'application/x-mpegURL',
    videoUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    posterUrl: ''
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
