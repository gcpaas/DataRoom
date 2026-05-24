<template>
  <div ref="decoration9" class="dv-decoration-9">
    <svg :width="`${state.svgWH[0]}px`" :height="`${state.svgWH[1]}px`" :style="`transform:scale(${state.svgScale[0]},${state.svgScale[1]});`">
      <defs>
        <polygon :id="state.polygonId" points="15, 46.5, 21, 47.5, 21, 52.5, 15, 53.5" />
      </defs>

      <circle
        cx="50"
        cy="50"
        r="45"
        fill="transparent"
        :stroke="state.mergedColor[1]"
        stroke-width="10"
        stroke-dasharray="80, 100, 30, 100"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 50 50;360 50 50"
          :dur="`${dur}s`"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="50"
        cy="50"
        r="45"
        fill="transparent"
        :stroke="state.mergedColor[0]"
        stroke-width="6"
        stroke-dasharray="50, 66, 100, 66"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 50 50;-360 50 50"
          :dur="`${dur}s`"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="50"
        cy="50"
        r="38"
        fill="transparent"
        :stroke="fade(state.mergedColor[1] || state.defaultColor[1], 30)"
        stroke-width="1"
        stroke-dasharray="5, 1"
      />

      <use
        v-for="(foo, i) in new Array(20).fill(0)"
        :key="i"
        :xlink:href="`#${state.polygonId}`"
        :stroke="state.mergedColor[1]"
        :fill="Math.random() > 0.4 ? 'transparent' : state.mergedColor[0]"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 50 50;360 50 50"
          :dur="`${dur}s`"
          :begin="`${i * dur / 20}s`"
          repeatCount="indefinite"
        />
      </use>

      <circle
        cx="50"
        cy="50"
        r="26"
        fill="transparent"
        :stroke="fade(state.mergedColor[1] || state.defaultColor[1], 30)"
        stroke-width="1"
        stroke-dasharray="5, 1"
      />
    </svg>

    <slot />
  </div>
</template>

<script setup>
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { deepClone, deepMerge, uuid } from '@/dataroom-packages/datav/utils'

import { fade } from '@jiaminghi/color'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
  dur: {
    type: Number,
    default: 3,
  },
})

const id = uuid()
const decoration9 = ref(null)
const state = reactive({
  polygonId: `decoration-9-polygon-${id}`,

  svgWH: [100, 100],

  svgScale: [1, 1],

  defaultColor: ['rgba(3, 166, 224, 0.8)', 'rgba(3, 166, 224, 0.5)'],

  mergedColor: [],
})

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})

const { width, height } = autoResize(decoration9, onResize, afterAutoResizeMixinInit)

function afterAutoResizeMixinInit() {
  calcScale()
}
function calcScale() {
  const [w, h] = state.svgWH

  state.svgScale = [width.value / w, height.value / h]
}
function onResize() {
  calcScale()
}
function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}
</script>

<style lang="less">
.dv-decoration-9 {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    position: absolute;
    left: 0px;
    top: 0px;
    transform-origin: left top;
  }
}
</style>
