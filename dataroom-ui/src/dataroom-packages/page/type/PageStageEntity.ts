import type {PageConfig} from "@/dataroom-packages/PageDesigner/type/PageConfig.ts";
import type {VisualScreenPageConfig} from "@/dataroom-packages/PageDesigner/type/VisualScreenPageConfig.ts";

/**
 * 页面实体定义
 */
export interface PageStageEntity {
  // ID
  id?: string
  // 页面名称
  name?: string
  // 页面编码
  pageCode: string
  // 备注描述
  remark: string
  // 页面类型
  pageType: string | 'directory' | 'visualScreen' | 'page'
  // 页面状态
  pageStatus: string | 'design' | 'published' | 'history' | 'preview' | 'snapshot'
  // 基础配置
  pageConfig: PageConfig | VisualScreenPageConfig
}
