import { ResourceType } from '@/dataRoom/constants/ResourceType'
import type { ResourceEntity } from '@/dataRoom/resource/api'
import { getResourceModelFormat } from '@/dataRoom/resource/resourceForm'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { DrImageConfig } from '@/dataRoom/components/DrImage/install.ts'
import type { DrModel3DConfig } from '@/dataRoom/components/DrModel3D/install.ts'
import type { DrVideoPlayerConfig } from '@/dataRoom/components/DrVideoPlayer/install.ts'
import { parseModelAppearanceConfig } from '@/dataRoom/three/modelConfig.ts'

export type ResourceChartType = 'DrImage' | 'DrModel3D' | 'DrVideoPlayer'

/**
 * 素材类型到画布组件类型的映射
 * 目录、页面封面等不支持的类型返回 null，由调用方提示，避免静默创建图片组件
 */
export const getResourceChartType = (resource?: ResourceEntity | null): ResourceChartType | null => {
  switch (resource?.resourceType) {
    case ResourceType.IMAGE:
      return 'DrImage'
    case ResourceType.MODEL:
      return 'DrModel3D'
    case ResourceType.VIDEO:
      return 'DrVideoPlayer'
    default:
      return null
  }
}

const isSvgUrl = (url: string) => {
  return (url.split(/[?#]/)[0] || '').toLowerCase().endsWith('.svg')
}

/**
 * 把素材信息写入组件配置
 * 模型素材会复制素材库中保存的外观配置快照，之后与素材库互不联动
 */
export const applyResourceToChart = (chart: ChartConfig<unknown>, resource: ResourceEntity): void => {
  const url = resource.url ?? ''

  if (resource.name?.trim()) {
    chart.title = resource.name.trim()
  }

  switch (chart.type) {
    case 'DrImage': {
      const imageChart = chart as DrImageConfig
      imageChart.props.url = url
      imageChart.props.imageType = isSvgUrl(url) ? 'svg' : 'bitmap'
      break
    }
    case 'DrModel3D': {
      const modelChart = chart as DrModel3DConfig
      const appearance = parseModelAppearanceConfig(resource.config)
      modelChart.props.modelUrl = url
      modelChart.props.modelFormat = getResourceModelFormat(resource)
      modelChart.props.coverImage = resource.thumbnail ?? ''
      modelChart.props.modelScale = appearance.modelScale
      modelChart.props.modelPosition = appearance.modelPosition
      modelChart.props.material = appearance.material
      modelChart.props.lighting = appearance.lighting
      modelChart.props.background = appearance.background
      break
    }
    case 'DrVideoPlayer': {
      const videoChart = chart as DrVideoPlayerConfig
      videoChart.props.basic.url = url
      videoChart.props.basic.poster = resource.thumbnail ?? ''
      break
    }
  }
}
