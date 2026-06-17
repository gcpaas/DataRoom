<template>
  <div ref="decoration3" class="dv-decoration-4">
    <div
      :class="`container ${reverse ? 'reverse' : 'normal'}`"
      :style="reverse ? `width:${width}px;height:5px;animation-duration:${dur}s` : `width:5px;height:${height}px;animation-duration:${dur}s`"
    >
      <svg :width="reverse ? width : 5" :height="reverse ? 5 : height">
        <polyline
          :stroke="state.mergedColor[0]"
          :points="reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`"
        />
        <polyline
          class="bold-line"
          :stroke="state.mergedColor[1]"
          stroke-width="3"
          stroke-dasharray="20, 80"
          stroke-dashoffset="-30"
          :points="reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`"
        />
      </svg>
    </div>
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
  dur: {
    type: Number,
    default: 3,
  },
})

const decoration3 = ref<HTMLElement | null>(null)

const state = reactive({
  defaultColor: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)'],
  mergedColor: [],
})

function mergeColor() {
  state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
}

const { width, height } = autoResize(decoration3)

watch(() => props.color, () => {
  mergeColor()
}, { deep: true })

onMounted(() => {
  mergeColor()
})
</script>

<style lang="less">
.dv-decoration-4 {
  position: relative;
  width: 100%;
  height: 100%;

  .container {
    display: flex;
    overflow: hidden;
    position: absolute;
    flex: 1;
  }

  .normal {
    animation: ani-height ease-in-out infinite;
    left: 50%;
    margin-left: -2px;
  }

  .reverse {
    animation: ani-width ease-in-out infinite;
    top: 50%;
    margin-top: -2px;
  }

  @keyframes ani-height {
    0% {
      height: 0%;
    }

    70% {
      height: 100%;
    }

    100% {
      height: 100%;
    }
  }

  @keyframes ani-width {
    0% {
      width: 0%;
    }

    70% {
      width: 100%;
    }

    100% {
      width: 100%;
    }
  }
}
</style>
