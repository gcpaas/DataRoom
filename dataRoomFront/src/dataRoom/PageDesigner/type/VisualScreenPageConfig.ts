import type {VisualScreenPageBasicConfig} from "@/dataRoom/PageDesigner/type/VisualScreenPageBasicConfig.ts";
import type {GlobalVariable} from "@/dataRoom/PageDesigner/type/GlobalVariable.ts";
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";

/**
 * 大屏配置
 */
export interface VisualScreenPageConfig {
  // 页面类型
  pageType: string
  //页面基础配置
  basicConfig: VisualScreenPageBasicConfig
  // 全局变量
  globalVariableList: GlobalVariable[]
  // 图表组件配置
  chartList: ChartConfig<unknown>[]
}
