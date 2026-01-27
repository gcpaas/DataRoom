import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";
import type {ChartDatasetParam} from "@/dataroom-packages/components/type/ChartDatasetParam.ts";

/**
 * 组件配置基础信息
 */
export interface ChartConfig<T> {
  // 唯一标识
  id: string
  // 唯一标识，仅仪表盘类型使用
  i: string
  // 组件类型
  type: string
  // 组件显示的图层名称 或 卡片名称
  title: string
  // 宽度或占用的份数
  w: number
  // 高度或占用的份数
  h: number
  // x坐标或x轴份数
  x: number
  // y坐标或y轴份数
  y: number
  // 组件层级、层级越大、越靠前显示
  z: number
  // X轴旋转角度
  rotateX: number
  // Y轴旋转角度
  rotateY: number
  // Z轴旋转角度
  rotateZ: number
  // 图表组件个性化配置
  props: T,
  // 子组件，仅在容器类组件有效
  children?: ChartConfig<unknown>[]
  // 图表交互
  behaviors?: {
    // key 为 交互名称，与Behavior中的name保持一致，value 为交互的行为定义
    [behaviorName: string]: {
      disabled: boolean
      actions: ChartAction[]
    }
  }
  // 数据集与字段绑定
  dataset: {
    // 数据集编码
    code: string
    // 字段绑定
    fields: {
      // key为图表对应的指标、维度、属性值等字段，value 为多个数据集字段名
      [key: string]: string[]
    },
    // 数据处理脚本
    script: string
    // 数据集入参、如果数据集需要入参的话
    params: {
      // key 为数据集入参名称，value 为当前入参的配置
      [key: string]: ChartDatasetParam
    }
  }
}
