<template>
  <div ref="decoration8" class="dv-decoration-8">
    <svg :width="width" :height="height">
      <polyline
        :stroke="state.mergedColor[0]"
        stroke-width="2"
        fill="transparent"
        :points="`${xPos(0)}, 0 ${xPos(30)}, ${height / 2}`"
      />

      <polyline
        :stroke="state.mergedColor[0]"
        stroke-width="2"
        fill="transparent"
        :points="`${xPos(20)}, 0 ${xPos(50)}, ${height / 2} ${xPos(width)}, ${height / 2}`"
      />

      <polyline
        :stroke="state.mergedColor[1]"
        fill="transparent"
        stroke-width="3"
        :points="`${xPos(0)}, ${height - 3}, ${xPos(200)}, ${height - 3}`"
      />
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
  reverse: {
    type: Boolean,
    default: false,
  },
})

const decoration8 = ref<HTMLElement | null>(null)
const state = reactive({
  defaultColor: ['#3f96a5', '#3f96a5'],

  mergedColor: [],
})

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})

const { width, height } = autoResize(decoration8)

function xPos(pos: number) {
  if (!props.reverse)
    return pos

  return width.value - pos
}

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}
</script>

<style lang="less">
.dv-decoration-8 {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
