<template>
  <div ref="decoration5" class="dv-decoration-5">
    <svg :width="width" :height="height">
      <polyline
        fill="transparent"
        :stroke="state.mergedColor[0]"
        stroke-width="3"
        :points="state.line1Points"
      >
        <animate
          attributeName="stroke-dasharray"
          attributeType="XML"
          :from="`0, ${state.line1Length / 2}, 0, ${state.line1Length / 2}`"
          :to="`0, 0, ${state.line1Length}, 0`"
          :dur="`${dur}s`"
          begin="0s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.4,1,0.49,0.98"
          repeatCount="indefinite"
        />
      </polyline>
      <polyline
        fill="transparent"
        :stroke="state.mergedColor[1]"
        stroke-width="2"
        :points="state.line2Points"
      >
        <animate
          attributeName="stroke-dasharray"
          attributeType="XML"
          :from="`0, ${state.line2Length / 2}, 0, ${state.line2Length / 2}`"
          :to="`0, 0, ${state.line2Length}, 0`"
          :dur="`${dur}s`"
          begin="0s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines=".4,1,.49,.98"
          repeatCount="indefinite"
        />
      </polyline>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { PointsToString, deepClone, deepMerge, getPolylineLength } from '@/dataRoom/datav/utils'
import type { Point } from '../../../types'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
  dur: {
    type: Number,
    default: 1.2,
  },
})

const decoration5 = ref<HTMLElement | null>(null)

const state = reactive({
  line1Points: '',
  line2Points: '',
  line1Length: 0,
  line2Length: 0,

  defaultColor: ['#3f96a5', '#3f96a5'],

  mergedColor: [],
})

function afterAutoResizeMixinInit() {
  calcSVGData()
}

function onResize() {
  calcSVGData()
}

const { width, height } = autoResize(decoration5, onResize, afterAutoResizeMixinInit)

function calcSVGData() {
  const line1Points: Array<Point> = [
    { x: 0, y: height.value * 0.2 }, { x: width.value * 0.18, y: height.value * 0.2 },
    { x: width.value * 0.2, y: height.value * 0.4 }, { x: width.value * 0.25, y: height.value * 0.4 },
    { x: width.value * 0.27, y: height.value * 0.6 }, { x: width.value * 0.72, y: height.value * 0.6 },
    { x: width.value * 0.75, y: height.value * 0.4 }, { x: width.value * 0.8, y: height.value * 0.4 },
    { x: width.value * 0.82, y: height.value * 0.2 }, { x: width.value, y: height.value * 0.2 },
  ]

  const line2Points: Array<Point> = [
    { x: width.value * 0.3, y: height.value * 0.8 }, { x: width.value * 0.7, y: height.value * 0.8 },
  ]

  const line1Length = getPolylineLength(line1Points)
  const line2Length = getPolylineLength(line2Points)

  state.line1Points = PointsToString(line1Points)
  state.line2Points = PointsToString(line2Points)

  state.line1Length = line1Length
  state.line2Length = line2Length
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
.dv-decoration-5 {
  width: 100%;
  height: 100%;
}
</style>
