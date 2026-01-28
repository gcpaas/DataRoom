/**
 * 大屏页面基础配置
 */
export interface VisualScreenPageBasicConfig {
  background: {
    // 背景填充方式
    fill: string | 'image' | 'color'
    // 背景色
    color: string
    // 背景图url
    url: string
    // 背景图透明度
    opacity: number
    // 背景图填充方式
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  }
  // 大屏尺寸
  size: {
    // 宽度、单位：像素
    width: number
    // 高度，单位：像素
    height: number
    // 缩放方式
    zoom: 'auto'
  }
}
