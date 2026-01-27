import type {Component} from "vue";

/**
 * 左侧工具bar定义
 */
export interface LeftToolBar {
  // tab显示名称
  name: string
  // 激活工具面板显示名称
  desc: string
  // 激活时工具面板组件
  component: Component
  // 组件名
  componentName: string
}
