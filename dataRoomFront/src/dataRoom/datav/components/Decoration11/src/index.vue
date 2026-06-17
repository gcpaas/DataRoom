<template>
  <div ref="decoration11" class="dv-decoration-11">
    <svg :width="width" :height="height">
      <polygon
        :fill="fade(state.mergedColor[1] || state.defaultColor[1], 10)"
        :stroke="state.mergedColor[1]"
        points="20 10, 25 4, 55 4 60 10"
      />

      <polygon
        :fill="fade(state.mergedColor[1] || state.defaultColor[1], 10)"
        :stroke="state.mergedColor[1]"
        :points="`20 ${height - 10}, 25 ${height - 4}, 55 ${height - 4} 60 ${height - 10}`"
      />

      <polygon
        :fill="fade(state.mergedColor[1] || state.defaultColor[1], 10)"
        :stroke="state.mergedColor[1]"
        :points="`${width - 20} 10, ${width - 25} 4, ${width - 55} 4 ${width - 60} 10`"
      />

      <polygon
        :fill="fade(state.mergedColor[1] || state.defaultColor[1], 10)"
        :stroke="state.mergedColor[1]"
        :points="`${width - 20} ${height - 10}, ${width - 25} ${height - 4}, ${width - 55} ${height - 4} ${width - 60} ${height - 10}`"
      />

      <polygon
        :fill="fade(state.mergedColor[0] || state.defaultColor[0], 20)"
        :stroke="state.mergedColor[0]"
        :points="`
          20 10, 5 ${height / 2} 20 ${height - 10}
          ${width - 20} ${height - 10} ${width - 5} ${height / 2} ${width - 20} 10
        `"
      />

      <polyline
        fill="transparent"
        :stroke="fade(state.mergedColor[0] || state.defaultColor[0], 70)"
        :points="`25 18, 15 ${height / 2} 25 ${height - 18}`"
      />

      <polyline
        fill="transparent"
        :stroke="fade(state.mergedColor[0] || state.defaultColor[0], 70)"
        :points="`${width - 25} 18, ${width - 15} ${height / 2} ${width - 25} ${height - 18}`"
      />
    </svg>

    <div class="decoration-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { deepClone, deepMerge } from '@/dataRoom/datav/utils'

import { fade } from '@jiaminghi/color'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})

const decoration11 = ref(null)

const state = reactive({
  defaultColor: ['#1a98fc', '#2cf7fe'],

  mergedColor: [],
})

const { width, height } = autoResize(decoration11)

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
.dv-decoration-11 {
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
