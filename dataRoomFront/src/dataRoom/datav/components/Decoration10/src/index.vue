<template>
  <div ref="decoration10" class="dv-decoration-10">
    <svg :width="width" :height="height">
      <polyline
        :stroke="state.mergedColor[1]"
        stroke-width="2"
        :points="`0, ${height / 2} ${width}, ${height / 2}`"
      />

      <polyline
        :stroke="state.mergedColor[0]"
        stroke-width="2"
        :points="`5, ${height / 2} ${width * 0.2 - 3}, ${height / 2}`"
        :stroke-dasharray="`0, ${width * 0.2}`"
        fill="freeze"
      >
        <animate
          :id="state.animationId2"
          attributeName="stroke-dasharray"
          :values="`0, ${width * 0.2};${width * 0.2}, 0;`"
          dur="3s"
          :begin="`${state.animationId1}.end`"
          fill="freeze"
        />
        <animate
          attributeName="stroke-dasharray"
          :values="`${width * 0.2}, 0;0, ${width * 0.2}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </polyline>

      <polyline
        :stroke="state.mergedColor[0]"
        stroke-width="2"
        :points="`${width * 0.2 + 3}, ${height / 2} ${width * 0.8 - 3}, ${height / 2}`"
        :stroke-dasharray="`0, ${width * 0.6}`"
      >
        <animate
          :id="state.animationId4"
          attributeName="stroke-dasharray"
          :values="`0, ${width * 0.6};${width * 0.6}, 0`"
          dur="3s"
          :begin="`${state.animationId3}.end + 1s`"
          fill="freeze"
        />
        <animate
          attributeName="stroke-dasharray"
          :values="`${width * 0.6}, 0;0, ${width * 0.6}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </polyline>

      <polyline
        :stroke="state.mergedColor[0]"
        stroke-width="2"
        :points="`${width * 0.8 + 3}, ${height / 2} ${width - 5}, ${height / 2}`"
        :stroke-dasharray="`0, ${width * 0.2}`"
      >
        <animate
          :id="state.animationId6"
          attributeName="stroke-dasharray"
          :values="`0, ${width * 0.2};${width * 0.2}, 0`"
          dur="3s"
          :begin="`${state.animationId5}.end + 1s`"
          fill="freeze"
        />
        <animate
          attributeName="stroke-dasharray"
          :values="`${width * 0.2}, 0;0, ${width * 0.3}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </polyline>

      <circle cx="2" :cy="height / 2" r="2" :fill="state.mergedColor[1]">
        <animate
          :id="state.animationId1"
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[0]}`"
          :begin="`0s;${state.animationId7}.end`"
          dur="0.3s"
          fill="freeze"
        />
      </circle>

      <circle :cx="width * 0.2" :cy="height / 2" r="2" :fill="state.mergedColor[1]">
        <animate
          :id="state.animationId3"
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[0]}`"
          :begin="`${state.animationId2}.end`"
          dur="0.3s"
          fill="freeze"
        />
        <animate
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[1]}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </circle>

      <circle :cx="width * 0.8" :cy="height / 2" r="2" :fill="state.mergedColor[1]">
        <animate
          :id="state.animationId5"
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[0]}`"
          :begin="`${state.animationId4}.end`"
          dur="0.3s"
          fill="freeze"
        />
        <animate
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[1]}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </circle>

      <circle :cx="width - 2" :cy="height / 2" r="2" :fill="state.mergedColor[1]">
        <animate
          :id="state.animationId7"
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[0]}`"
          :begin="`${state.animationId6}.end`"
          dur="0.3s"
          fill="freeze"
        />
        <animate
          attributeName="fill"
          :values="`${state.mergedColor[1]};${state.mergedColor[1]}`"
          dur="0.01s"
          :begin="`${state.animationId7}.end`"
          fill="freeze"
        />
      </circle>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { deepClone, deepMerge, uuid } from '@/dataRoom/datav/utils'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})

const id = uuid()
const decoration10 = ref<HTMLElement | null>(null)

const state = reactive({
  animationId1: `d10ani1${id}`,
  animationId2: `d10ani2${id}`,
  animationId3: `d10ani3${id}`,
  animationId4: `d10ani4${id}`,
  animationId5: `d10ani5${id}`,
  animationId6: `d10ani6${id}`,
  animationId7: `d10ani7${id}`,
  defaultColor: ['#00c2ff', 'rgba(0, 194, 255, 0.3)'],
  mergedColor: [],
})

const { width, height } = autoResize(decoration10)

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}
</script>

<style lang="less">
.dv-decoration-10 {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
