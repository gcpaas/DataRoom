import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from './ChartConfig'

/** 组件库创建入口；id 与运行时 componentType 分离。 */
export interface ChartPreset {
  id: string
  componentType: string
  name: string
  desc: string
  thumbnail: string
  tags: string[]
  getInstance: (pageType: PageType) => ChartConfig<unknown>
}
