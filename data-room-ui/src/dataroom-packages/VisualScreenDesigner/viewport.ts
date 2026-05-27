export const ZOOM_MIN_PERCENT = 1
export const ZOOM_MAX_PERCENT = 400
export const ZOOM_DEFAULT_PERCENT = 100
export const ZOOM_STEP_PERCENT = 1
export const ZOOM_WHEEL_STEP_PERCENT = 5
export const ZOOM_CONTROL_OFFSET_PX = 16
export const ZOOM_FIT_PADDING_PX = 16
export const RIGHT_PANEL_WIDTH_PX = 300

export type DesignerZoomDirection = 'in' | 'out'
export type DesignerZoomPreferenceMode = 'best' | 'fixed'
export type DesignerZoomWheelModifier = 'ctrl' | 'meta'

export interface DesignerZoomPreference {
  mode: DesignerZoomPreferenceMode
  value: number
  visiable: boolean
}

export const DEFAULT_DESIGNER_ZOOM_PREFERENCE: DesignerZoomPreference = {
  mode: 'best',
  value: ZOOM_DEFAULT_PERCENT,
  visiable: true,
}

export type DesignerZoomPreferenceInput = Partial<DesignerZoomPreference> & {
  visible?: boolean
}

export interface DesignerViewportPoint {
  viewportX: number
  viewportY: number
}

export interface DesignerViewportSizeInput {
  canvasWidth: number
  canvasHeight: number
  viewportWidth: number
  viewportHeight: number
}

export interface DesignerViewportState extends DesignerViewportSizeInput {
  scale: number
  panX: number
  panY: number
}

export interface DesignerViewportFitInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export type DesignerViewportFitPadding = number | Partial<DesignerViewportFitInsets>

export const clampDesignerZoomPercent = (value: number, fallback: number = ZOOM_DEFAULT_PERCENT) => {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(ZOOM_MAX_PERCENT, Math.max(ZOOM_MIN_PERCENT, Math.round(safeValue)))
}

export const getDesignerZoomScale = (percent: number) => clampDesignerZoomPercent(percent) / 100

export const getDesignerZoomPercent = (scale: number) => clampDesignerZoomPercent(scale * 100)

export const getDesignerZoomByStep = (
  currentPercent: number,
  direction: DesignerZoomDirection,
  step: number = ZOOM_STEP_PERCENT,
) => {
  const delta = direction === 'in' ? step : -step
  return clampDesignerZoomPercent(currentPercent + delta)
}

export const getDesignerZoomFromWheel = (currentPercent: number, deltaY: number) => {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return clampDesignerZoomPercent(currentPercent)
  }
  const direction: DesignerZoomDirection = deltaY < 0 ? 'in' : 'out'
  return getDesignerZoomByStep(currentPercent, direction, ZOOM_WHEEL_STEP_PERCENT)
}

export const getDesignerZoomWheelModifier = (platform: string = ''): DesignerZoomWheelModifier => {
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? 'meta' : 'ctrl'
}

export const isDesignerZoomWheelEvent = (
  event: Pick<WheelEvent, 'ctrlKey' | 'metaKey'>,
  platform: string = '',
) => {
  return getDesignerZoomWheelModifier(platform) === 'meta' ? event.metaKey : event.ctrlKey
}

export const getDesignerZoomControlRightOffset = (rightPanelVisible: boolean) => {
  return rightPanelVisible ? RIGHT_PANEL_WIDTH_PX + ZOOM_CONTROL_OFFSET_PX : ZOOM_CONTROL_OFFSET_PX
}

export const normalizeDesignerZoomPreference = (
  preference?: DesignerZoomPreferenceInput | null,
): DesignerZoomPreference => {
  const visiable = typeof preference?.visiable === 'boolean'
    ? preference.visiable
    : typeof preference?.visible === 'boolean'
      ? preference.visible
      : DEFAULT_DESIGNER_ZOOM_PREFERENCE.visiable
  return {
    mode: preference?.mode === 'fixed' ? 'fixed' : 'best',
    value: clampDesignerZoomPercent(Number(preference?.value), ZOOM_DEFAULT_PERCENT),
    visiable,
  }
}

export const normalizeDesignerViewportFitInsets = (
  padding: DesignerViewportFitPadding = ZOOM_FIT_PADDING_PX,
): DesignerViewportFitInsets => {
  if (typeof padding === 'number') {
    const safePadding = Math.max(0, finiteOrFallback(padding, ZOOM_FIT_PADDING_PX))
    return {
      top: safePadding,
      right: safePadding,
      bottom: safePadding,
      left: safePadding,
    }
  }
  return {
    top: Math.max(0, finiteOrFallback(Number(padding.top), ZOOM_FIT_PADDING_PX)),
    right: Math.max(0, finiteOrFallback(Number(padding.right), ZOOM_FIT_PADDING_PX)),
    bottom: Math.max(0, finiteOrFallback(Number(padding.bottom), ZOOM_FIT_PADDING_PX)),
    left: Math.max(0, finiteOrFallback(Number(padding.left), ZOOM_FIT_PADDING_PX)),
  }
}

export const getDesignerFitZoomPercent = (
  viewport: DesignerViewportSizeInput,
  padding: DesignerViewportFitPadding = ZOOM_FIT_PADDING_PX,
) => {
  return getDesignerZoomPercent(getDesignerFitZoomScale(viewport, padding))
}

export const getDesignerFitZoomScale = (
  viewport: DesignerViewportSizeInput,
  padding: DesignerViewportFitPadding = ZOOM_FIT_PADDING_PX,
) => {
  const canvasWidth = normalizeDesignerSize(viewport.canvasWidth)
  const canvasHeight = normalizeDesignerSize(viewport.canvasHeight)
  const viewportWidth = normalizeDesignerSize(viewport.viewportWidth)
  const viewportHeight = normalizeDesignerSize(viewport.viewportHeight)
  const insets = normalizeDesignerViewportFitInsets(padding)
  const availableWidth = Math.max(0, viewportWidth - insets.left - insets.right)
  const availableHeight = Math.max(0, viewportHeight - insets.top - insets.bottom)
  if (canvasWidth <= 0 || canvasHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return getDesignerZoomScale(ZOOM_MIN_PERCENT)
  }
  const fitScale = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight)
  return Math.min(getDesignerZoomScale(ZOOM_MAX_PERCENT), Math.max(getDesignerZoomScale(ZOOM_MIN_PERCENT), fitScale))
}

const finiteOrFallback = (value: number, fallback: number) => {
  return Number.isFinite(value) ? value : fallback
}

const positiveFiniteOrFallback = (value: number, fallback: number) => {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const normalizeDesignerScale = (scale: number) => {
  return getDesignerZoomScale(
    getDesignerZoomPercent(positiveFiniteOrFallback(scale, getDesignerZoomScale(ZOOM_DEFAULT_PERCENT))),
  )
}

const normalizeDesignerSize = (value: number) => Math.max(0, finiteOrFallback(value, 0))

const normalizeDesignerViewportPoint = (point: DesignerViewportPoint): DesignerViewportPoint => {
  return {
    viewportX: finiteOrFallback(point.viewportX, 0),
    viewportY: finiteOrFallback(point.viewportY, 0),
  }
}

const normalizeViewportAxis = (contentSize: number, viewportSize: number, pan: number) => {
  const safePan = finiteOrFallback(pan, 0)
  if (contentSize <= viewportSize) {
    return (viewportSize - contentSize) / 2
  }
  return Math.min(0, Math.max(viewportSize - contentSize, safePan))
}

const getViewportAxisFitPan = (
  contentSize: number,
  viewportSize: number,
  startInset: number,
  endInset: number,
) => {
  const safeViewportSize = normalizeDesignerSize(viewportSize)
  const safeStartInset = Math.min(safeViewportSize, Math.max(0, finiteOrFallback(startInset, ZOOM_FIT_PADDING_PX)))
  const safeEndInset = Math.max(0, finiteOrFallback(endInset, ZOOM_FIT_PADDING_PX))
  const safeEnd = Math.max(safeStartInset, safeViewportSize - safeEndInset)
  const safeSize = safeEnd - safeStartInset
  return safeStartInset + (safeSize - contentSize) / 2
}

export const normalizeDesignerViewport = (viewport: DesignerViewportState): DesignerViewportState => {
  const scale = normalizeDesignerScale(viewport.scale)
  const canvasWidth = normalizeDesignerSize(viewport.canvasWidth)
  const canvasHeight = normalizeDesignerSize(viewport.canvasHeight)
  const viewportWidth = normalizeDesignerSize(viewport.viewportWidth)
  const viewportHeight = normalizeDesignerSize(viewport.viewportHeight)

  return {
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    scale,
    panX: normalizeViewportAxis(canvasWidth * scale, viewportWidth, viewport.panX),
    panY: normalizeViewportAxis(canvasHeight * scale, viewportHeight, viewport.panY),
  }
}

export const createDesignerViewport = (
  input: DesignerViewportSizeInput & Partial<Pick<DesignerViewportState, 'scale' | 'panX' | 'panY'>>,
) => {
  return normalizeDesignerViewport({
    canvasWidth: input.canvasWidth,
    canvasHeight: input.canvasHeight,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
    scale: input.scale ?? getDesignerZoomScale(ZOOM_DEFAULT_PERCENT),
    panX: input.panX ?? 0,
    panY: input.panY ?? 0,
  })
}

export const updateDesignerViewportSize = (
  viewport: DesignerViewportState,
  input: DesignerViewportSizeInput,
) => {
  return normalizeDesignerViewport({
    ...viewport,
    ...input,
  })
}

export const fitDesignerViewportToVisibleArea = (
  viewport: DesignerViewportState,
  padding: DesignerViewportFitPadding = ZOOM_FIT_PADDING_PX,
) => {
  const canvasWidth = normalizeDesignerSize(viewport.canvasWidth)
  const canvasHeight = normalizeDesignerSize(viewport.canvasHeight)
  const viewportWidth = normalizeDesignerSize(viewport.viewportWidth)
  const viewportHeight = normalizeDesignerSize(viewport.viewportHeight)
  const insets = normalizeDesignerViewportFitInsets(padding)
  const fitScale = getDesignerFitZoomScale({ canvasWidth, canvasHeight, viewportWidth, viewportHeight }, padding)
  const scaledCanvasWidth = canvasWidth * fitScale
  const scaledCanvasHeight = canvasHeight * fitScale
  return {
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    scale: fitScale,
    panX: getViewportAxisFitPan(scaledCanvasWidth, viewportWidth, insets.left, insets.right),
    panY: getViewportAxisFitPan(scaledCanvasHeight, viewportHeight, insets.top, insets.bottom),
  }
}

export const getDesignerViewportCenterPoint = (viewport: DesignerViewportState): DesignerViewportPoint => {
  const normalized = normalizeDesignerViewport(viewport)
  return {
    viewportX: normalized.viewportWidth / 2,
    viewportY: normalized.viewportHeight / 2,
  }
}

export const getDesignerViewportCanvasPoint = (
  viewport: DesignerViewportState,
  point: DesignerViewportPoint,
) => {
  const normalized = normalizeDesignerViewport(viewport)
  const normalizedPoint = normalizeDesignerViewportPoint(point)
  return {
    x: (normalizedPoint.viewportX - normalized.panX) / normalized.scale,
    y: (normalizedPoint.viewportY - normalized.panY) / normalized.scale,
  }
}

export const zoomDesignerViewportAroundPoint = (
  viewport: DesignerViewportState,
  nextScale: number,
  point: DesignerViewportPoint = getDesignerViewportCenterPoint(viewport),
) => {
  const scale = normalizeDesignerScale(nextScale)
  const normalizedPoint = normalizeDesignerViewportPoint(point)
  const canvasPoint = getDesignerViewportCanvasPoint(viewport, normalizedPoint)
  return normalizeDesignerViewport({
    ...viewport,
    scale,
    panX: normalizedPoint.viewportX - canvasPoint.x * scale,
    panY: normalizedPoint.viewportY - canvasPoint.y * scale,
  })
}

export const panDesignerViewport = (
  viewport: DesignerViewportState,
  deltaX: number,
  deltaY: number,
) => {
  const safeDeltaX = finiteOrFallback(deltaX, 0)
  const safeDeltaY = finiteOrFallback(deltaY, 0)
  return normalizeDesignerViewport({
    ...viewport,
    panX: viewport.panX - safeDeltaX,
    panY: viewport.panY - safeDeltaY,
  })
}

export const panDesignerViewportByPointerDelta = (
  viewport: DesignerViewportState,
  deltaX: number,
  deltaY: number,
) => {
  const safeDeltaX = finiteOrFallback(deltaX, 0)
  const safeDeltaY = finiteOrFallback(deltaY, 0)
  return normalizeDesignerViewport({
    ...viewport,
    panX: viewport.panX + safeDeltaX,
    panY: viewport.panY + safeDeltaY,
  })
}
