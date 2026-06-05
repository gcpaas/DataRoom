<template>
  <div ref="decoration3" class="dv-decoration-3">
    <svg :width="`${state.svgWH[0]}px`" :height="`${state.svgWH[1]}px`" :style="`transform:scale(${state.svgScale[0]},${state.svgScale[1]});`">

      <template
        v-for="point in state.points"
        :key="point"
      >
        <rect
          :fill="state.mergedColor[0]"
          :x="point[0] - state.halfPointSideLength"
          :y="point[1] - state.halfPointSideLength"
          :width="pointSideLength"
          :height="pointSideLength"
        >
          <animate
            v-if="Math.random() > 0.6"
            attributeName="fill"
            :values="`${state.mergedColor.join(';')}`"
            :dur="`${Math.random() + 1}s`"
            :begin="Math.random() * 2"
            repeatCount="indefinite"
          />
        </rect>
      </template>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})

const pointSideLength = 7
const decoration3 = ref<HTMLElement | null>(null)
const state = reactive({
  svgWH: [300, 35],
  svgScale: [1, 1],
  rowNum: 2,
  rowPoints: 25,
  pointSideLength,
  halfPointSideLength: pointSideLength / 2,
  points: [] as number[][],
  defaultColor: ['#7acaec', 'transparent'],
  mergedColor: [],
})

function calcPointsPosition() {
  const [w, h] = state.svgWH

  const horizontalGap = w / (state.rowPoints + 1)
  const verticalGap = h / (state.rowNum + 1)

  const points = Array.from({ length: state.rowNum }).fill(0).map((foo, i) =>
    Array.from({ length: state.rowPoints }).fill(0).map((foo, j) => [
      horizontalGap * (j + 1), verticalGap * (i + 1),
    ]))

  state.points = points.reduce((all, item) => [...all, ...item], [])
}

function afterAutoResizeMixinInit() {
  calcSVGData()
}

function calcSVGData() {
  calcPointsPosition()

  calcScale()
}

function onResize() {
  calcSVGData()
}

const { width, height } = autoResize(decoration3, onResize, afterAutoResizeMixinInit)

function calcScale() {
  const [w, h] = state.svgWH

  state.svgScale = [width.value / w, height.value / h]
}

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})
</script>

<style lang="less">
.dv-decoration-3 {
  width: 100%;
  height: 100%;

  svg {
    transform-origin: left top;
  }
}
</style>
