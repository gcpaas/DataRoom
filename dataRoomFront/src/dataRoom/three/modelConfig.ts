/**
 * 3D 模型外观配置的默认值与规范化
 * 素材库预览、画布 DrModel3D 与 ThreeModelViewer 共用，避免默认值漂移和字段缺失
 */

export interface MaterialConfig {
  color: string
  roughness: number
  metalness: number
  opacity: number
  transparent: boolean
  wireframe: boolean
}

export interface LightingConfig {
  ambient: { enabled: boolean; color: string; intensity: number }
  directional: { enabled: boolean; color: string; intensity: number }
  point: { enabled: boolean; color: string; intensity: number }
}

export interface BackgroundConfig {
  type: 'color'
  value: string
}

export interface ModelTransformConfig {
  modelScale: number
  modelPosition: { x: number; y: number; z: number }
}

export interface ModelAppearanceConfig extends ModelTransformConfig {
  material: MaterialConfig
  lighting: LightingConfig
  background: BackgroundConfig
}

export const defaultMaterialConfig: MaterialConfig = {
  color: '#4a90e2',
  roughness: 0.5,
  metalness: 0.3,
  opacity: 1.0,
  transparent: false,
  wireframe: false
}

export const defaultLightingConfig: LightingConfig = {
  ambient: { enabled: true, color: '#ffffff', intensity: 0.6 },
  directional: { enabled: true, color: '#ffffff', intensity: 0.8 },
  point: { enabled: false, color: '#ff9900', intensity: 1.0 }
}

export const defaultBackgroundConfig: BackgroundConfig = {
  type: 'color',
  value: '#1a1a2e'
}

const toNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.min(max, Math.max(min, parsed))
}

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback
}

const toColor = (value: unknown, fallback: string): string => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const toRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

const toLightItem = (value: unknown, fallback: LightingConfig['ambient']) => {
  const item = toRecord(value)
  return {
    enabled: toBoolean(item.enabled, fallback.enabled),
    color: toColor(item.color, fallback.color),
    intensity: toNumber(item.intensity, fallback.intensity, 0, 5)
  }
}

export const normalizeMaterialConfig = (value: unknown): MaterialConfig => {
  const raw = toRecord(value)
  return {
    color: toColor(raw.color, defaultMaterialConfig.color),
    roughness: toNumber(raw.roughness, defaultMaterialConfig.roughness, 0, 1),
    metalness: toNumber(raw.metalness, defaultMaterialConfig.metalness, 0, 1),
    opacity: toNumber(raw.opacity, defaultMaterialConfig.opacity, 0, 1),
    transparent: toBoolean(raw.transparent, defaultMaterialConfig.transparent),
    wireframe: toBoolean(raw.wireframe, defaultMaterialConfig.wireframe)
  }
}

export const normalizeLightingConfig = (value: unknown): LightingConfig => {
  const raw = toRecord(value)
  return {
    ambient: toLightItem(raw.ambient, defaultLightingConfig.ambient),
    directional: toLightItem(raw.directional, defaultLightingConfig.directional),
    point: toLightItem(raw.point, defaultLightingConfig.point)
  }
}

export const normalizeBackgroundConfig = (value: unknown): BackgroundConfig => {
  const raw = toRecord(value)
  return {
    type: 'color',
    value: toColor(raw.value, defaultBackgroundConfig.value)
  }
}

export const MODEL_SCALE_MIN = 0.1
export const MODEL_SCALE_MAX = 10

export const normalizeModelTransformConfig = (value: unknown): ModelTransformConfig => {
  const raw = toRecord(value)
  const position = toRecord(raw.modelPosition)
  const finite = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback
  return {
    modelScale: Math.min(MODEL_SCALE_MAX, Math.max(MODEL_SCALE_MIN, finite(raw.modelScale, 1))),
    modelPosition: {
      x: finite(position.x, 0),
      y: finite(position.y, 0),
      z: finite(position.z, 0),
    },
  }
}

export const normalizeModelAppearanceConfig = (value: unknown): ModelAppearanceConfig => {
  const raw = toRecord(value)
  return {
    ...normalizeModelTransformConfig(raw),
    material: normalizeMaterialConfig(raw.material),
    lighting: normalizeLightingConfig(raw.lighting),
    background: normalizeBackgroundConfig(raw.background)
  }
}

/**
 * 解析素材上保存的模型配置（JSON 字符串）
 * 解析失败或字段缺失时回退到默认值，不抛出
 */
export const parseModelAppearanceConfig = (config?: string | null): ModelAppearanceConfig => {
  if (!config) {
    return normalizeModelAppearanceConfig(null)
  }
  try {
    return normalizeModelAppearanceConfig(JSON.parse(config))
  } catch {
    return normalizeModelAppearanceConfig(null)
  }
}
