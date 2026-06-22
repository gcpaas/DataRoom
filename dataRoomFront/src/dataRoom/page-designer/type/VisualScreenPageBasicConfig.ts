import type { PageTimer } from '@/dataRoom/page-designer/type/PageTimer.ts'
import type { VisualScreenRulerConfig } from '@/dataRoom/visual-screen-designer/ruler'

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
    zoom: 'fitWidth' | 'fitHeight' | 'cover' | 'contain' | 'none'
  }
  // 设计器编辑态缩放偏好
  zoom?: {
    mode: 'best' | 'fixed'
    value: number
    visiable?: boolean
    visible?: boolean
  }
  // 设计器编辑态标尺与参考线配置
  ruler?: VisualScreenRulerConfig
  // 定时器配置列表
  timers?: PageTimer[]
}
