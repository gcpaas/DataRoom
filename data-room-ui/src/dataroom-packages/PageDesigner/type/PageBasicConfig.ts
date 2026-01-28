import type {PageTimer} from "@/dataroom-packages/PageDesigner/type/PageTimer.ts";

/**
 * 页面基础配置
 */
export interface PageBasicConfig {
  // 页面背景设置
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
  // 定时器配置列表
  timers?: PageTimer[]
}
