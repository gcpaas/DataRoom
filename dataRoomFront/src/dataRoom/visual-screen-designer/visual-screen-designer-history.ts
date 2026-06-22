import type { ChartConfig } from '../components/type/ChartConfig.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import type { VisualScreenPageBasicConfig } from '../page-designer/type/VisualScreenPageBasicConfig.ts'
import type { PageStageEntity } from '../page/type/PageStageEntity.ts'

interface CreateVisualScreenPageConfigPayloadOptions {
  pageStageEntity: PageStageEntity | null | undefined
  chartList: ChartConfig<unknown>[]
  basicConfig: VisualScreenPageBasicConfig
  globalVariableList: GlobalVariable[]
}

export const createVisualScreenPageConfigPayload = ({
  pageStageEntity,
  chartList,
  basicConfig,
  globalVariableList,
}: CreateVisualScreenPageConfigPayloadOptions): PageStageEntity | null => {
  if (!pageStageEntity) {
    return null
  }

  return {
    ...pageStageEntity,
    pageConfig: {
      ...pageStageEntity.pageConfig,
      chartList,
      basicConfig,
      globalVariableList,
    },
  }
}
