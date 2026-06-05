import type {PageBasicConfig} from "@/dataroom-packages/PageDesigner/type/PageBasicConfig.ts";
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";

/**
 * 页面配置
 */
export interface PageConfig {
  // 页面类型
  pageType: string
  // 页面基础配置
  basicConfig: PageBasicConfig
  // 全局变量
  globalVariableList: GlobalVariable[]
  // 图表组件配置
  chartList: ChartConfig<unknown>[]
}
