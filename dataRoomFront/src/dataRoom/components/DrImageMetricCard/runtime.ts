import { getFirstFieldValue, type DatasetRow } from '../_shared/metric-table-utils.ts'

export type ImageMetricRepeatMode =
  | 'no-repeat-stretch'
  | 'no-repeat-contain'
  | 'no-repeat-center'
  | 'repeat'
  | 'repeat-x'
  | 'repeat-y'

export interface ImageMetricGlowConfig {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export const resolveImageMetricValue = (
  row: DatasetRow | undefined,
  fields: Record<string, string[]> | undefined,
  defaultValue: number,
): unknown => {
  const datasetValue = getFirstFieldValue(row, fields, 'valueField')
  return datasetValue === undefined || datasetValue === null ? defaultValue : datasetValue
}

export const getImageMetricBackgroundStyle = (
  imageUrl: string,
  repeatMode: ImageMetricRepeatMode,
  borderRadius: number,
): Record<string, string> => {
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    borderRadius: `${borderRadius}px`,
  }
  if (imageUrl) {
    style.backgroundImage = `url(${imageUrl})`
  }

  switch (repeatMode) {
    case 'no-repeat-stretch':
      style.backgroundSize = '100% 100%'
      style.backgroundRepeat = 'no-repeat'
      break
    case 'no-repeat-contain':
      style.backgroundSize = 'contain'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'no-repeat-center':
      style.backgroundSize = 'auto'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'repeat':
      style.backgroundRepeat = 'repeat'
      break
    case 'repeat-x':
      style.backgroundRepeat = 'repeat-x'
      break
    case 'repeat-y':
      style.backgroundRepeat = 'repeat-y'
      break
  }

  return style
}

export const getImageMetricTextShadow = (glow: ImageMetricGlowConfig): string | undefined => {
  if (!glow.enabled) {
    return undefined
  }
  return `${glow.offsetX}px ${glow.offsetY}px ${glow.blur}px ${glow.color || 'currentColor'}`
}
