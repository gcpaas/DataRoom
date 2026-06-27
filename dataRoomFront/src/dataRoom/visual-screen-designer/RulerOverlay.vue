<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { DesignerViewportPoint, DesignerViewportState } from './viewport'
import {
  clampVisualScreenGuidePosition,
  getCanvasCoordinateFromViewportPoint,
  getRulerTicks,
  getViewportPointFromCanvasCoordinate,
  isVisualScreenGuideLocked,
  RULER_SIZE_PX,
  type VisualScreenGuide,
  type VisualScreenGuideAxis,
  type VisualScreenRulerConfig,
} from './ruler'

type GuideDragState =
  | {
      mode: 'create'
      axis: VisualScreenGuideAxis
      pointerId: number
    }
  | {
      mode: 'move'
      axis: VisualScreenGuideAxis
      guideId: string
      pointerId: number
    }

const props = defineProps<{
  ruler: VisualScreenRulerConfig
  viewport: DesignerViewportState
  pointerPosition: DesignerViewportPoint | null
}>()

const emit = defineEmits<{
  'update:ruler': [ruler: VisualScreenRulerConfig]
  'interaction-start': []
  'interaction-end': []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const dragState = ref<GuideDragState | null>(null)
const previewGuide = ref<{ axis: VisualScreenGuideAxis; position: number } | null>(null)

const horizontalTicks = computed(() => getRulerTicks(props.viewport, 'x', RULER_SIZE_PX, props.viewport.viewportWidth))
const verticalTicks = computed(() => getRulerTicks(props.viewport, 'y', RULER_SIZE_PX, props.viewport.viewportHeight))
const canEditGuides = computed(() => props.ruler.guidesVisible && !props.ruler.guidesLocked)

const pointerCanvasPosition = computed(() => {
  if (!props.pointerPosition) {
    return null
  }
  return {
    x: getCanvasCoordinateFromViewportPoint(props.viewport, 'x', props.pointerPosition.viewportX),
    y: getCanvasCoordinateFromViewportPoint(props.viewport, 'y', props.pointerPosition.viewportY),
  }
})

const pointerXStyle = computed<CSSProperties>(() => {
  if (!pointerCanvasPosition.value) {
    return {}
  }
  return {
    left: `${getViewportPointFromCanvasCoordinate(props.viewport, 'x', pointerCanvasPosition.value.x)}px`,
  }
})

const pointerYStyle = computed<CSSProperties>(() => {
  if (!pointerCanvasPosition.value) {
    return {}
  }
  return {
    top: `${getViewportPointFromCanvasCoordinate(props.viewport, 'y', pointerCanvasPosition.value.y)}px`,
  }
})

const cloneRuler = (): VisualScreenRulerConfig => ({
  ...props.ruler,
  verticalGuides: props.ruler.verticalGuides.map((guide) => ({ ...guide })),
  horizontalGuides: props.ruler.horizontalGuides.map((guide) => ({ ...guide })),
})

const getGuideListKey = (axis: VisualScreenGuideAxis) => {
  return axis === 'vertical' ? 'verticalGuides' : 'horizontalGuides'
}

const getPointerViewportPoint = (event: PointerEvent) => {
  const rect = overlayRef.value?.getBoundingClientRect()
  if (!rect) {
    return null
  }
  return {
    viewportX: event.clientX - rect.left,
    viewportY: event.clientY - rect.top,
  }
}

const getRawGuidePositionFromPointer = (event: PointerEvent, axis: VisualScreenGuideAxis) => {
  const point = getPointerViewportPoint(event)
  if (!point) {
    return 0
  }
  return axis === 'vertical'
    ? getCanvasCoordinateFromViewportPoint(props.viewport, 'x', point.viewportX)
    : getCanvasCoordinateFromViewportPoint(props.viewport, 'y', point.viewportY)
}

const getGuidePositionFromPointer = (event: PointerEvent, axis: VisualScreenGuideAxis) => {
  const coordinate = getRawGuidePositionFromPointer(event, axis)
  return clampVisualScreenGuidePosition(axis, coordinate, props.viewport.canvasWidth, props.viewport.canvasHeight)
}

const isPointerInsideCanvasBounds = (event: PointerEvent, axis: VisualScreenGuideAxis) => {
  const point = getPointerViewportPoint(event)
  if (!point) {
    return false
  }
  const position = getRawGuidePositionFromPointer(event, axis)
  const limit = axis === 'vertical' ? props.viewport.canvasWidth : props.viewport.canvasHeight
  const crossedRuler = axis === 'vertical' ? point.viewportY >= RULER_SIZE_PX : point.viewportX >= RULER_SIZE_PX
  return crossedRuler && position >= 0 && position <= limit
}

const startInteraction = (state: GuideDragState, event: PointerEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragState.value = state
  previewGuide.value = {
    axis: state.axis,
    position: getGuidePositionFromPointer(event, state.axis),
  }
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerCancel)
  emit('interaction-start')
}

const stopInteraction = () => {
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerCancel)
  dragState.value = null
  previewGuide.value = null
  emit('interaction-end')
}

const onRulerPointerDown = (axis: VisualScreenGuideAxis, event: PointerEvent) => {
  if (!canEditGuides.value || event.button !== 0) {
    return
  }
  startInteraction({ mode: 'create', axis, pointerId: event.pointerId }, event)
}

const onGuidePointerDown = (axis: VisualScreenGuideAxis, guide: VisualScreenGuide, event: PointerEvent) => {
  if (!canEditGuides.value || event.button !== 0 || isVisualScreenGuideLocked(guide, props.ruler.guidesLocked)) {
    return
  }
  startInteraction({ mode: 'move', axis, guideId: guide.id, pointerId: event.pointerId }, event)
}

const onGuideDoubleClick = (axis: VisualScreenGuideAxis, guide: VisualScreenGuide, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (isVisualScreenGuideLocked(guide, props.ruler.guidesLocked)) {
    return
  }
  const nextRuler = cloneRuler()
  const listKey = getGuideListKey(axis)
  nextRuler[listKey] = nextRuler[listKey].filter((item) => item.id !== guide.id)
  emit('update:ruler', nextRuler)
}

const updateGuidePosition = (state: Extract<GuideDragState, { mode: 'move' }>, position: number) => {
  const nextRuler = cloneRuler()
  const list = nextRuler[getGuideListKey(state.axis)]
  const guide = list.find((item) => item.id === state.guideId)
  if (!guide || isVisualScreenGuideLocked(guide, nextRuler.guidesLocked)) {
    return
  }
  guide.position = position
  emit('update:ruler', nextRuler)
}

const createGuide = (axis: VisualScreenGuideAxis, position: number) => {
  const nextRuler = cloneRuler()
  nextRuler[getGuideListKey(axis)].push({
    id: `guide_${axis}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    position,
    locked: false,
  })
  emit('update:ruler', nextRuler)
}

const onWindowPointerMove = (event: PointerEvent) => {
  const state = dragState.value
  if (!state || event.pointerId !== state.pointerId) {
    return
  }
  event.preventDefault()
  const position = getGuidePositionFromPointer(event, state.axis)
  previewGuide.value = { axis: state.axis, position }
  if (state.mode === 'move') {
    updateGuidePosition(state, position)
  }
}

const onWindowPointerUp = (event: PointerEvent) => {
  const state = dragState.value
  if (!state || event.pointerId !== state.pointerId) {
    return
  }
  event.preventDefault()
  const position = getGuidePositionFromPointer(event, state.axis)
  if (state.mode === 'create' && isPointerInsideCanvasBounds(event, state.axis)) {
    createGuide(state.axis, position)
  }
  stopInteraction()
}

const onWindowPointerCancel = (event: PointerEvent) => {
  const state = dragState.value
  if (!state || event.pointerId !== state.pointerId) {
    return
  }
  event.preventDefault()
  stopInteraction()
}

const getGuideStyle = (axis: VisualScreenGuideAxis, position: number): CSSProperties => {
  if (axis === 'vertical') {
    return {
      left: `${getViewportPointFromCanvasCoordinate(props.viewport, 'x', position)}px`,
    }
  }
  return {
    top: `${getViewportPointFromCanvasCoordinate(props.viewport, 'y', position)}px`,
  }
}

onBeforeUnmount(() => {
  stopInteraction()
})
</script>

<template>
  <div ref="overlayRef" class="ruler-overlay">
    <template v-if="ruler.visible">
      <div class="ruler-corner" aria-hidden="true"></div>
      <div class="ruler ruler--horizontal" @pointerdown="(event) => onRulerPointerDown('vertical', event)">
        <div
          v-for="tick in horizontalTicks"
          :key="tick.key"
          class="ruler-tick ruler-tick--horizontal"
          :class="{ 'ruler-tick--major': tick.major }"
          :style="{ left: `${tick.viewportPosition}px`, height: `${tick.size}px` }"
        >
          <span v-if="tick.label" class="ruler-label ruler-label--horizontal">{{ tick.label }}</span>
        </div>
      </div>
      <div class="ruler ruler--vertical" @pointerdown="(event) => onRulerPointerDown('horizontal', event)">
        <div
          v-for="tick in verticalTicks"
          :key="tick.key"
          class="ruler-tick ruler-tick--vertical"
          :class="{ 'ruler-tick--major': tick.major }"
          :style="{ top: `${tick.viewportPosition}px`, width: `${tick.size}px` }"
        >
          <span v-if="tick.label" class="ruler-label ruler-label--vertical">{{ tick.label }}</span>
        </div>
      </div>
      <template v-if="pointerCanvasPosition">
        <div class="ruler-pointer ruler-pointer--x" :style="pointerXStyle"></div>
        <div class="ruler-pointer ruler-pointer--y" :style="pointerYStyle"></div>
      </template>
    </template>

    <template v-if="ruler.guidesVisible">
      <div
        v-for="guide in ruler.verticalGuides"
        :key="guide.id"
        class="guide-line guide-line--vertical"
        :class="{ 'guide-line--locked': isVisualScreenGuideLocked(guide, ruler.guidesLocked) }"
        :style="getGuideStyle('vertical', guide.position)"
        @pointerdown="(event) => onGuidePointerDown('vertical', guide, event)"
        @dblclick="(event) => onGuideDoubleClick('vertical', guide, event)"
      ></div>
      <div
        v-for="guide in ruler.horizontalGuides"
        :key="guide.id"
        class="guide-line guide-line--horizontal"
        :class="{ 'guide-line--locked': isVisualScreenGuideLocked(guide, ruler.guidesLocked) }"
        :style="getGuideStyle('horizontal', guide.position)"
        @pointerdown="(event) => onGuidePointerDown('horizontal', guide, event)"
        @dblclick="(event) => onGuideDoubleClick('horizontal', guide, event)"
      ></div>
      <div
        v-if="previewGuide"
        class="guide-line guide-line--preview"
        :class="{
          'guide-line--vertical': previewGuide.axis === 'vertical',
          'guide-line--horizontal': previewGuide.axis === 'horizontal',
        }"
        :style="getGuideStyle(previewGuide.axis, previewGuide.position)"
      ></div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ruler-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.ruler-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  border-right: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-light);
  pointer-events: auto;
}

.ruler {
  position: absolute;
  box-sizing: border-box;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  overflow: hidden;
  pointer-events: auto;
  user-select: none;
}

.ruler--horizontal {
  top: 0;
  right: 0;
  left: 24px;
  height: 24px;
  border-bottom: 1px solid var(--el-border-color);
  cursor: ns-resize;
}

.ruler--vertical {
  top: 24px;
  bottom: 0;
  left: 0;
  width: 24px;
  border-right: 1px solid var(--el-border-color);
  cursor: ew-resize;
}

.ruler-tick {
  position: absolute;
  background-color: var(--el-border-color);
}

.ruler-tick--horizontal {
  bottom: 0;
  width: 1px;
}

.ruler-tick--vertical {
  right: 0;
  height: 1px;
}

.ruler-label {
  position: absolute;
  font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
  font-size: 10px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  color: var(--el-text-color-secondary);
  font-feature-settings: 'tnum';
  pointer-events: none;
}

.ruler-label--horizontal {
  left: 3px;
  bottom: 9px;
}

.ruler-label--vertical {
  top: 3px;
  right: 9px;
  transform: rotate(-90deg);
  transform-origin: right top;
}

.ruler-pointer {
  position: absolute;
  background-color: var(--el-color-primary);
  opacity: 0.15;
  pointer-events: none;
}

.ruler-pointer--x {
  top: 0;
  width: 1px;
  height: 24px;
}

.ruler-pointer--y {
  left: 0;
  width: 24px;
  height: 1px;
}

.guide-line {
  position: absolute;
  background-color: var(--el-color-primary);
  opacity: 0.65;
  pointer-events: auto;
}

.guide-line--vertical {
  top: 0;
  bottom: 0;
  width: 1px;
  cursor: ew-resize;
}

.guide-line--horizontal {
  right: 0;
  left: 0;
  height: 1px;
  cursor: ns-resize;
}

.guide-line--locked {
  cursor: default;
  opacity: 0.35;
}

.guide-line--preview {
  opacity: 0.35;
  pointer-events: none;
}
</style>
