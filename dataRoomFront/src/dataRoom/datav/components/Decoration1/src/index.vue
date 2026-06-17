<template>
  <div ref="dvDecoration1" class="dv-decoration-1">
    <svg
      :width="`${svgWH[0]}px`" :height="`${svgWH[1]}px`"
      :style="`transform:scale(${state.svgScale[0]}, ${state.svgScale[1]});`"
    >

      <template v-for="point in state.points" :key="point">
        <rect
          v-if="Math.random() > 0.6" :fill="state.mergedColor[0]" :x="point[0] - halfPointSideLength"
          :y="point[1] - halfPointSideLength" :width="pointSideLength" :height="pointSideLength"
        >
          <animate
            v-if="Math.random() > 0.6" attributeName="fill" :values="`${state.mergedColor[0]};transparent`"
            dur="1s" :begin="Math.random() * 2" repeatCount="indefinite"
          />
        </rect>
      </template>

      <rect
        v-if="state.rects[0]" :fill="state.mergedColor[1]" :x="state.rects[0][0] - pointSideLength"
        :y="state.rects[0][1] - pointSideLength" :width="pointSideLength * 2" :height="pointSideLength * 2"
      >
        <animate attributeName="width" :values="`0;${pointSideLength * 2}`" dur="2s" repeatCount="indefinite" />
        <animate attributeName="height" :values="`0;${pointSideLength * 2}`" dur="2s" repeatCount="indefinite" />
        <animate
          attributeName="x" :values="`${state.rects[0][0]};${state.rects[0][0] - pointSideLength}`" dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y" :values="`${state.rects[0][1]};${state.rects[0][1] - pointSideLength}`" dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      <rect
        v-if="state.rects[1]" :fill="state.mergedColor[1]" :x="state.rects[1][0] - 40"
        :y="state.rects[1][1] - pointSideLength" :width="40" :height="pointSideLength * 2"
      >
        <animate attributeName="width" values="0;40;0" dur="2s" repeatCount="indefinite" />
        <animate
          attributeName="x" :values="`${state.rects[1][0]};${state.rects[1][0] - 40};${state.rects[1][0]}`"
          dur="2s" repeatCount="indefinite"
        />
      </rect>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { deepClone, deepMerge } from '@/dataRoom/datav/utils'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})

const dvDecoration1 = ref<HTMLElement | null>(null)

const svgWH = reactive([200, 50])

const rowNum = ref(4)
const rowPoints = ref(20)

const pointSideLength = ref(2.5)
const halfPointSideLength = ref(pointSideLength.value / 2)

const defaultColor = reactive(['#fff', '#0de7c2'])

const state = reactive({
  mergedColor: [],
  rects: [],
  points: [],
  svgScale: [1, 1],
})

function onResize() {
  calcSVGData()
}

function afterAutoResizeMixinInit() {
  calcSVGData()
}

const { width, height } = autoResize(dvDecoration1, onResize, afterAutoResizeMixinInit)

function calcPointsPosition() {
  const [w, h] = svgWH
  const horizontalGap = w / (rowPoints.value + 1)
  const verticalGap = h / (rowNum.value + 1)

  const newPoints: Array<any> = Array.from({ length: rowNum.value }).fill(0).map((foo, i) =>
    Array.from({ length: rowPoints.value }).fill(0).map((foo, j) => [
      horizontalGap * (j + 1), verticalGap * (i + 1),
    ]))

  state.points = newPoints.reduce((all, item) => [...all, ...item], [])
}

function calcRectsPosition() {
  const rect1 = state.points[rowPoints.value * 2 - 1]
  const rect2 = state.points[rowPoints.value * 2 - 3]

  state.rects = [rect1, rect2]
}

function calcScale() {
  const [w, h] = svgWH

  state.svgScale = [width.value / w, height.value / h]
}

function calcSVGData() {
  calcPointsPosition()
  calcRectsPosition()
  calcScale()
}

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(defaultColor, true), props.color || [])
}

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})
</script>

<style lang="less">
.dv-decoration-1 {
  width: 100%;
  height: 100%;

  svg {
    transform-origin: left top;
  }
}
</style>
