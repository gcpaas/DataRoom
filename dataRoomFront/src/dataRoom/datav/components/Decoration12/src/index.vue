<template>
  <div ref="decoration12" class="dv-decoration-12">
    <svg :width="width" :height="height">
      <defs>
        <g :id="state.gId">
          <path
            v-for="(d, i) in state.pathD"
            :key="d"
            :stroke="state.pathColor[i]"
            :stroke-width="width / 2"
            fill="transparent"
            :d="d"
          />
        </g>

        <radialGradient
          :id="state.gradientId"
          cx="50%" cy="50%" r="50%"
        >
          <stop offset="0%" stop-color="transparent" stop-opacity="1" />
          <stop offset="100%" :stop-color="fade(state.mergedColor[1] || state.defaultColor[1], 30)" stop-opacity="1" />
        </radialGradient>
      </defs>

      <circle
        v-for="r in state.circleR"
        :key="r"
        :r="r"
        :cx="x"
        :cy="y"
        :stroke="state.mergedColor[1]"
        :stroke-width="0.8"
        fill="transparent"
      />

      <circle
        r="1"
        :cx="x"
        :cy="y"
        stroke="transparent"
        :fill="`url(#${state.gradientId})`"
      >
        <animate
          attributeName="r"
          :values="`1;${width / 2}`"
          :dur="`${haloDur}s`"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0"
          :dur="`${haloDur}s`"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        r="2"
        :cx="x"
        :cy="y"
        :fill="state.mergedColor[1]"
      />

      <g v-if="state.showSplitLine">
        <polyline
          v-for="p in state.splitLinePoints"
          :key="p"
          :points="p"
          :stroke="state.mergedColor[1]"
          :stroke-width="0.5"
          opacity="50"
        />
      </g>

      <path
        v-for="d in state.arcD"
        :key="d"
        :d="d"
        :stroke="state.mergedColor[1]"
        stroke-width="2.3"
        fill="transparent"
      />

      <use :xlink:href="`#${state.gId}`">
        <animateTransform
          attributeName="transform"
          type="rotate"
          :values="`0, ${x} ${y};360, ${x} ${y}`"
          :dur="`${scanDur}s`"
          repeatCount="indefinite"
        />
      </use>
    </svg>

    <div class="decoration-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { deepClone, deepMerge, getCircleRadianPoint, uuid } from '@/dataRoom/datav/utils'

import { fade } from '@jiaminghi/color'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
  /**
   * @description Scan animation dur
   */
  scanDur: {
    type: Number,
    default: 3,
  },
  /**
   * @description Halo animation dur
   */
  haloDur: {
    type: Number,
    default: 2,
  },
})

const id = uuid()
const decoration12 = ref(null)
const { width, height } = autoResize(decoration12, () => {}, afterAutoResizeMixinInit)

const state = reactive({
  gId: `decoration-12-g-${id}`,
  gradientId: `decoration-12-gradient-${id}`,

  defaultColor: ['#2783ce', '#2cf7fe'],

  mergedColor: [],

  pathD: [],

  pathColor: [],

  circleR: [],

  splitLinePoints: [],

  arcD: [],

  segment: 30,

  sectorAngle: Math.PI / 3,

  ringNum: 3,

  ringWidth: 1,

  showSplitLine: true,
})

const x = computed(() => {
  return width.value / 2
})

const y = computed(() => {
  return height.value / 2
})

watch(() => props.color, () => {
  mergeColor()
  calcPathColor()
}, { deep: true })

function init() {
  mergeColor()

  calcPathD()

  calcPathColor()

  calcCircleR()

  calcSplitLinePoints()

  calcArcD()
}

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}

function calcPathD() {
  const startAngle = -Math.PI / 2
  const angleGap = state.sectorAngle / state.segment
  const r = width.value / 4
  let lastEndPoints = getCircleRadianPoint(x.value, y.value, r, startAngle)

  state.pathD = Array.from({ length: state.segment })
    .fill('')
    .map((_, i) => {
      const endPoints = getCircleRadianPoint(x.value, y.value, r, startAngle - (i + 1) * angleGap).map(_ => Number.parseFloat(_.toFixed(5)))
      const d = `M${lastEndPoints.join(',')} A${r}, ${r} 0 0 0 ${endPoints.join(',')}`
      lastEndPoints = endPoints
      return d
    })
}

function calcPathColor() {
  const colorGap = 100 / (state.segment - 1)

  state.pathColor = Array.from({ length: state.segment })
    .fill(state.mergedColor[0])
    .map((_, i) => fade(state.mergedColor[0], 100 - i * colorGap))
}

function calcCircleR() {
  const radiusGap = (width.value / 2 - state.ringWidth / 2) / state.ringNum

  state.circleR = Array.from({ length: state.ringNum })
    .fill(0)
    .map((_, i) => radiusGap * (i + 1))
}

function calcSplitLinePoints() {
  const angleGap = Math.PI / 6
  const r = width.value / 2

  state.splitLinePoints = Array.from({ length: 6 })
    .fill('')
    .map((_, i) => {
      const startAngle = angleGap * (i + 1)
      const endAngle = startAngle + Math.PI
      const startPoint = getCircleRadianPoint(x.value, y.value, r, startAngle)
      const endPoint = getCircleRadianPoint(x.value, y.value, r, endAngle)

      return `${startPoint.join(',')} ${endPoint.join(',')}`
    })
}

function calcArcD() {
  const angleGap = Math.PI / 6
  const r = width.value / 2 - 1

  state.arcD = Array.from({ length: 4 })
    .fill('')
    .map((_, i) => {
      const startAngle = angleGap * (3 * i + 1)
      const endAngle = startAngle + angleGap
      const startPoint = getCircleRadianPoint(x.value, y.value, r, startAngle)
      const endPoint = getCircleRadianPoint(x.value, y.value, r, endAngle)

      return `M${startPoint.join(',')} A${x.value}, ${y.value} 0 0 1 ${endPoint.join(',')}`
    })
}

function afterAutoResizeMixinInit() {
  init()
}
</script>

<style lang="less">
.dv-decoration-12 {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;

  .decoration-content {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
