import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {Reactive} from "vue";

/**
 * 图表行为交互、作为高代码方法入参
 */
export interface BehaviorEventParam {
  // 画布实例
  canvasInst: Reactive<CanvasInst>
  // 触发事件时参数，一般与组件 install.ts 中定义的behaviors.paramsList内容保持一致
  params: any
}
