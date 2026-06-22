import type { DesignerViewportState } from './viewport'

export const RULER_SIZE_PX = 24
export const BUILT_IN_GUIDE_INTERVAL_PX = 50
export const RULER_MIN_TICK_SPACING_PX = 8
export const RULER_MIN_LABEL_SPACING_PX = 48

export type VisualScreenGuideAxis = 'horizontal' | 'vertical'
export type VisualScreenRulerAxis = 'x' | 'y'

export interface VisualScreenGuide {
  id: string
  position: number
  locked: boolean
}

export interface VisualScreenRulerConfig {
  visible: boolean
  guidesVisible: boolean
  guidesLocked: boolean
  verticalGuides: VisualScreenGuide[]
  horizontalGuides: VisualScreenGuide[]
}

export interface VisualScreenRulerTick {
  key: string
  value: number
  viewportPosition: number
  size: number
  major: boolean
  label: string
}

export const DEFAULT_VISUAL_SCREEN_RULER_CONFIG: VisualScreenRulerConfig = {
  visible: true,
  guidesVisible: true,
  guidesLocked: false,
  verticalGuides: [],
  horizontalGuides: [],
}

const finiteOrFallback = (value: number, fallback: number) => {
  return Number.isFinite(value) ? value : fallback
}

const normalizeBoolean = (value: unknown, fallback: boolean) => {
  return typeof value === 'boolean' ? value : fallback
}

const getCanvasLimitByAxis = (axis: VisualScreenGuideAxis, canvasWidth: number, canvasHeight: number) => {
  return axis === 'vertical' ? Math.max(0, finiteOrFallback(canvasWidth, 0)) : Math.max(0, finiteOrFallback(canvasHeight, 0))
}

export const clampVisualScreenGuidePosition = (axis: VisualScreenGuideAxis, position: number, canvasWidth: number, canvasHeight: number) => {
  const safePosition = finiteOrFallback(position, 0)
  const limit = getCanvasLimitByAxis(axis, canvasWidth, canvasHeight)
  return Math.min(limit, Math.max(0, Math.round(safePosition)))
}

const normalizeGuideList = (guides: unknown, axis: VisualScreenGuideAxis, canvasWidth: number, canvasHeight: number) => {
  if (!Array.isArray(guides)) {
    return []
  }
  return guides
    .filter((guide): guide is Partial<VisualScreenGuide> => {
      return Boolean(
        guide &&
          typeof guide === 'object' &&
          typeof (guide as Partial<VisualScreenGuide>).id === 'string' &&
          (guide as Partial<VisualScreenGuide>).id!.length > 0 &&
          Number.isFinite(Number((guide as Partial<VisualScreenGuide>).position)),
      )
    })
    .map((guide) => ({
      id: guide.id!,
      position: clampVisualScreenGuidePosition(axis, Number(guide.position), canvasWidth, canvasHeight),
      locked: Boolean(guide.locked),
    }))
}

export const normalizeVisualScreenRulerConfig = (
  config: Partial<VisualScreenRulerConfig> | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
): VisualScreenRulerConfig => {
  return {
    visible: normalizeBoolean(config?.visible, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.visible),
    guidesVisible: normalizeBoolean(config?.guidesVisible, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.guidesVisible),
    guidesLocked: normalizeBoolean(config?.guidesLocked, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.guidesLocked),
    verticalGuides: normalizeGuideList(config?.verticalGuides, 'vertical', canvasWidth, canvasHeight),
    horizontalGuides: normalizeGuideList(config?.horizontalGuides, 'horizontal', canvasWidth, canvasHeight),
  }
}

export const isVisualScreenGuideLocked = (guide: Pick<VisualScreenGuide, 'locked'>, guidesLocked: boolean) => {
  return guidesLocked || guide.locked
}

export const getCanvasCoordinateFromViewportPoint = (viewport: DesignerViewportState, axis: VisualScreenRulerAxis, viewportPosition: number, rulerOffset: number = 0) => {
  const pan = axis === 'x' ? viewport.panX : viewport.panY
  return (finiteOrFallback(viewportPosition, 0) - rulerOffset - pan) / viewport.scale
}

export const getViewportPointFromCanvasCoordinate = (viewport: DesignerViewportState, axis: VisualScreenRulerAxis, canvasCoordinate: number, rulerOffset: number = 0) => {
  const pan = axis === 'x' ? viewport.panX : viewport.panY
  return finiteOrFallback(canvasCoordinate, 0) * viewport.scale + pan + rulerOffset
}

const getBuiltInGuidelines = (limit: number) => {
  const safeLimit = Math.max(0, finiteOrFallback(limit, 0))
  const guides: number[] = []
  for (let position = BUILT_IN_GUIDE_INTERVAL_PX; position <= safeLimit; position += BUILT_IN_GUIDE_INTERVAL_PX) {
    guides.push(position)
  }
  return guides
}

const uniqueSortedGuides = (guides: number[]) => {
  return [...new Set(guides.map((guide) => Math.round(guide)).filter((guide) => Number.isFinite(guide)))].sort((left, right) => left - right)
}

export const getVisualScreenMoveableGuidelines = (ruler: VisualScreenRulerConfig, canvasWidth: number, canvasHeight: number) => {
  const verticalGuidelines = getBuiltInGuidelines(canvasWidth)
  const horizontalGuidelines = getBuiltInGuidelines(canvasHeight)
  if (ruler.guidesVisible) {
    verticalGuidelines.push(...ruler.verticalGuides.map((guide) => guide.position))
    horizontalGuidelines.push(...ruler.horizontalGuides.map((guide) => guide.position))
  }
  return {
    verticalGuidelines: uniqueSortedGuides(verticalGuidelines),
    horizontalGuidelines: uniqueSortedGuides(horizontalGuidelines),
  }
}

const getNiceTickStep = (scale: number) => {
  const safeScale = Math.max(0.01, finiteOrFallback(scale, 1))
  const minimumCanvasStep = RULER_MIN_TICK_SPACING_PX / safeScale
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
  return steps.find((step) => step >= minimumCanvasStep) ?? steps[steps.length - 1] ?? 1000
}

export const getRulerTicks = (viewport: DesignerViewportState, axis: VisualScreenRulerAxis, rulerOffset: number, viewportLength: number): VisualScreenRulerTick[] => {
  const safeViewportLength = Math.max(0, finiteOrFallback(viewportLength, 0))
  const step = getNiceTickStep(viewport.scale)
  const labelEvery = Math.max(1, Math.ceil(RULER_MIN_LABEL_SPACING_PX / (step * viewport.scale)))
  const startCoordinate = Math.max(0, getCanvasCoordinateFromViewportPoint(viewport, axis, rulerOffset))
  const endCoordinate = Math.max(startCoordinate, getCanvasCoordinateFromViewportPoint(viewport, axis, safeViewportLength))
  const firstTick = Math.floor(startCoordinate / step) * step
  const ticks: VisualScreenRulerTick[] = []
  for (let value = firstTick; value <= endCoordinate + step; value += step) {
    if (value < 0) {
      continue
    }
    const tickIndex = Math.round(value / step)
    const major = tickIndex % labelEvery === 0
    ticks.push({
      key: `${axis}-${value}`,
      value,
      viewportPosition: getViewportPointFromCanvasCoordinate(viewport, axis, value),
      size: major ? 12 : 6,
      major,
      label: major ? String(Math.round(value)) : '',
    })
  }
  return ticks.filter((tick) => tick.viewportPosition >= rulerOffset && tick.viewportPosition <= safeViewportLength)
}
