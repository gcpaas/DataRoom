<template>
  <div class="dv-decoration-7">
    <svg width="21px" height="20px">
      <polyline
        stroke-width="4"
        fill="transparent"
        :stroke="state.mergedColor[0]"
        points="10, 0 19, 10 10, 20"
      />
      <polyline
        stroke-width="2"
        fill="transparent"
        :stroke="state.mergedColor[1]"
        points="2, 0 11, 10 2, 20"
      />
    </svg>
    <slot />
    <svg width="21px" height="20px">
      <polyline
        stroke-width="4"
        fill="transparent"
        :stroke="state.mergedColor[0]"
        points="11, 0 2, 10 11, 20"
      />
      <polyline
        stroke-width="2"
        fill="transparent"
        :stroke="state.mergedColor[1]"
        points="19, 0 10, 10 19, 20"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  color: {
    type: Array,
    default: () => ([]),
  },
})

const state = reactive({
  defaultColor: ['#1dc1f5', '#1dc1f5'],
  mergedColor: [],
})

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
.dv-decoration-7 {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
