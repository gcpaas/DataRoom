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

export interface VisualScreenGuideBounds {
  min: number
  max: number
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

const normalizeGuidePosition = (position: number, fallback: number = 0) => {
  return Math.round(finiteOrFallback(position, fallback))
}

const normalizeGuideBounds = (bounds: VisualScreenGuideBounds): VisualScreenGuideBounds => {
  const min = finiteOrFallback(bounds.min, 0)
  const max = finiteOrFallback(bounds.max, min)
  return min <= max ? { min, max } : { min: max, max: min }
}

export const normalizeVisualScreenGuidePosition = (position: number, fallback: number = 0) => {
  return normalizeGuidePosition(position, fallback)
}

export const clampVisualScreenGuidePositionToBounds = (position: number, bounds: VisualScreenGuideBounds) => {
  const safeBounds = normalizeGuideBounds(bounds)
  const safePosition = normalizeGuidePosition(position, safeBounds.min)
  return Math.min(safeBounds.max, Math.max(safeBounds.min, safePosition))
}

const normalizeGuideList = (guides: unknown) => {
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
      position: normalizeVisualScreenGuidePosition(Number(guide.position)),
      locked: Boolean(guide.locked),
    }))
}

export const normalizeVisualScreenRulerConfig = (
  config: Partial<VisualScreenRulerConfig> | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
): VisualScreenRulerConfig => {
  void canvasWidth
  void canvasHeight
  return {
    visible: normalizeBoolean(config?.visible, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.visible),
    guidesVisible: normalizeBoolean(config?.guidesVisible, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.guidesVisible),
    guidesLocked: normalizeBoolean(config?.guidesLocked, DEFAULT_VISUAL_SCREEN_RULER_CONFIG.guidesLocked),
    verticalGuides: normalizeGuideList(config?.verticalGuides),
    horizontalGuides: normalizeGuideList(config?.horizontalGuides),
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

export const getVisibleCanvasCoordinateBounds = (
  viewport: DesignerViewportState,
  axis: VisualScreenRulerAxis,
  startViewportPosition: number,
  endViewportPosition: number,
): VisualScreenGuideBounds => {
  const start = getCanvasCoordinateFromViewportPoint(viewport, axis, startViewportPosition)
  const end = getCanvasCoordinateFromViewportPoint(viewport, axis, endViewportPosition)
  return normalizeGuideBounds({ min: start, max: end })
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
  const startCoordinate = getCanvasCoordinateFromViewportPoint(viewport, axis, rulerOffset)
  const endCoordinate = getCanvasCoordinateFromViewportPoint(viewport, axis, safeViewportLength)
  const minCoordinate = Math.min(startCoordinate, endCoordinate)
  const maxCoordinate = Math.max(startCoordinate, endCoordinate)
  const firstTick = Math.floor(minCoordinate / step) * step
  const ticks: VisualScreenRulerTick[] = []
  for (let value = firstTick; value <= maxCoordinate + step; value += step) {
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
