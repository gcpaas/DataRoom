<template>
  <div ref="decoration6" class="dv-decoration-6">
    <svg :width="`${state.svgWH[0]}px`" :height="`${state.svgWH[1]}px`" :style="`transform:scale(${state.svgScale[0]},${state.svgScale[1]});`">
      <template
        v-for="(point, i) in state.points"
        :key="i"
      >
        <rect
          :fill="state.mergedColor[Math.random() > 0.5 ? 0 : 1]"
          :x="point[0] - state.halfRectWidth"
          :y="point[1] - state.heights[i] / 2"
          :width="rectWidth"
          :height="state.heights[i]"
        >
          <animate
            attributeName="y"
            :values="`${point[1] - state.minHeights[i] / 2};${point[1] - state.heights[i] / 2};${point[1] - state.minHeights[i] / 2}`"
            :dur="`${state.randoms[i]}s`"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="height"
            :values="`${state.minHeights[i]};${state.heights[i]};${state.minHeights[i]}`"
            :dur="`${state.randoms[i]}s`"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
            begin="0s"
            repeatCount="indefinite"
          />
        </rect>
      </template>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { deepClone, deepMerge, randomExtend } from '@/dataRoom/datav/utils'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})
const rectWidth = 7
const decoration6 = ref<HTMLElement | null>(null)

const state = reactive({
  svgWH: [300, 35],

  svgScale: [1, 1],

  rowNum: 1,
  rowPoints: 40,

  rectWidth,
  halfRectWidth: rectWidth / 2,

  points: [] as number[][],
  heights: [] as number[],
  minHeights: [] as number[],
  randoms: [] as number[],

  defaultColor: ['#7acaec', '#7acaec'],

  mergedColor: [],
})

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})

const { width, height } = autoResize(decoration6, onResize, afterAutoResizeMixinInit)

function afterAutoResizeMixinInit() {
  calcSVGData()
}
function calcSVGData() {
  calcPointsPosition()

  calcScale()
}
function calcPointsPosition() {
  const [w, h] = state.svgWH

  const horizontalGap = w / (state.rowPoints + 1)
  const verticalGap = h / (state.rowNum + 1)

  const points = Array.from({ length: state.rowNum }).fill(0).map((foo, i) =>
    Array.from({ length: state.rowPoints }).fill(0).map((foo, j) => [
      horizontalGap * (j + 1), verticalGap * (i + 1),
    ]))

  state.points = points.reduce((all, item) => [...all, ...item], [])
  const heights = state.heights = Array.from({ length: state.rowNum * state.rowPoints })
    .fill(0).map(() =>
      Math.random() > 0.8 ? randomExtend(0.7 * h, h) : randomExtend(0.2 * h, 0.5 * h))

  state.minHeights = Array.from({ length: state.rowNum * state.rowPoints })
    .fill(0).map((foo, i) => heights[i] * Math.random())

  state.randoms = Array.from({ length: state.rowNum * state.rowPoints })
    .fill(0).map(() => Math.random() + 1.5)
}
function calcScale() {
  const [w, h] = state.svgWH

  state.svgScale = [width.value / w, height.value / h]
}

function onResize() {
  calcSVGData()
}
function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}
</script>

<style lang="less">
.dv-decoration-6 {
  width: 100%;
  height: 100%;

  svg {
    transform-origin: left top;
  }
}
</style>
