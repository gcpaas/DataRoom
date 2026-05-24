<template>
  <div ref="percentPond" class="dv-percent-pond">
    <svg>
      <defs>
        <linearGradient :id="state.gradientId1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            v-for="lc in linearGradient" :key="lc[0]"
            :offset="`${lc[0]}%`"
            :stop-color="lc[1]"
          />
        </linearGradient>

        <linearGradient :id="state.gradientId2" x1="0%" y1="0%" :x2="gradient2XPos" y2="0%">
          <stop
            v-for="lc in linearGradient" :key="lc[0]"
            :offset="`${lc[0]}%`"
            :stop-color="lc[1]"
          />
        </linearGradient>
      </defs>
      <rect
        :x="state.mergedConfig ? state.mergedConfig.borderWidth / 2 : '0'"
        :y="state.mergedConfig ? state.mergedConfig.borderWidth / 2 : '0'"
        :rx="state.mergedConfig ? state.mergedConfig.borderRadius : '0'"
        :ry="state.mergedConfig ? state.mergedConfig.borderRadius : '0'"
        fill="transparent"
        :stroke-width="state.mergedConfig ? state.mergedConfig.borderWidth : '0'"
        :stroke="`url(#${state.gradientId1})`"
        :width="rectWidth > 0 ? rectWidth : 0"
        :height="rectHeight > 0 ? rectHeight : 0"
      />
      <polyline
        :stroke-width="polylineWidth"
        :stroke-dasharray="state.mergedConfig ? state.mergedConfig.lineDash.join(',') : '0'"
        :stroke="`url(#${polylineGradient})`"
        :points="points"
      />
      <text
        :stroke="state.mergedConfig ? state.mergedConfig.textColor : '#fff'"
        :fill="state.mergedConfig ? state.mergedConfig.textColor : '#fff'"
        :x="state.width / 2"
        :y="state.height / 2"
      >
        {{ details }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { deepClone, deepMerge, uuid } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
})
const id = uuid()
const percentPond = ref(null)
const state = reactive({
  gradientId1: `percent-pond-gradientId1-${id}`,
  gradientId2: `percent-pond-gradientId2-${id}`,

  width: 0,
  height: 0,

  defaultConfig: {
    /**
     * @description Value
     * @type {number}
     * @default value = 0
     */
    value: 0,
    /**
     * @description Colors (hex|rgb|rgba|color keywords)
     * @type {Array<string>}
     * @default colors = ['#00BAFF', '#3DE7C9']
     * @example colors = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
     */
    colors: ['#3DE7C9', '#00BAFF'],
    /**
     * @description Border width
     * @type {number}
     * @default borderWidth = 3
     */
    borderWidth: 3,
    /**
     * @description Gap between border and pond
     * @type {number}
     * @default borderGap = 3
     */
    borderGap: 3,
    /**
     * @description Line dash
     * @type {Array<number>}
     * @default lineDash = [5, 1]
     */
    lineDash: [5, 1],
    /**
     * @description Text color
     * @type {string}
     * @default textColor = '#fff'
     */
    textColor: '#fff',
    /**
     * @description Border radius
     * @type {number}
     * @default borderRadius = 5
     */
    borderRadius: 5,
    /**
     * @description Local Gradient
     * @type {boolean}
     * @default localGradient = false
     * @example localGradient = false | true
     */
    localGradient: false,
    /**
     * @description Formatter
     * @type {string}
     * @default formatter = '{value}%'
     */
    formatter: '{value}%',
  },

  mergedConfig: null,
})

const rectWidth = computed(() => {
  if (!state.mergedConfig)
    return 0

  const { borderWidth } = state.mergedConfig

  return state.width - borderWidth
})

const rectHeight = computed(() => {
  if (!state.mergedConfig)
    return 0

  const { borderWidth } = state.mergedConfig

  return state.height - borderWidth
})

const points = computed(() => {
  const halfHeight = state.height / 2

  if (!state.mergedConfig)
    return `0, ${halfHeight} 0, ${halfHeight}`

  const { borderWidth, borderGap, value } = state.mergedConfig

  const polylineLength = (state.width - (borderWidth + borderGap) * 2) / 100 * value

  return `
        ${borderWidth + borderGap}, ${halfHeight}
        ${borderWidth + borderGap + polylineLength}, ${halfHeight + 0.001}
      `
})

const polylineWidth = computed(() => {
  if (!state.mergedConfig)
    return 0

  const { borderWidth, borderGap } = state.mergedConfig

  return state.height - (borderWidth + borderGap) * 2
})

const linearGradient = computed(() => {
  if (!state.mergedConfig)
    return []

  const { colors } = state.mergedConfig

  const colorNum = colors.length

  const colorOffsetGap = 100 / (colorNum - 1)

  return colors.map((c, i) => [colorOffsetGap * i, c])
})

const polylineGradient = computed(() => {
  if (!state.mergedConfig)
    return state.gradientId2

  if (state.mergedConfig.localGradient)
    return state.gradientId1

  return state.gradientId2
})

const gradient2XPos = computed(() => {
  if (!state.mergedConfig)
    return '100%'

  const { value } = state.mergedConfig

  return `${200 - value}%`
})

const details = computed(() => {
  if (!state.mergedConfig)
    return ''

  const { value, formatter } = state.mergedConfig

  return formatter.replace('{value}', value)
})

watch(() => props.config, () => {
  mergeConfig()
}, {
  deep: true,
})

onMounted(() => {
  init()
})

async function init() {
  await initWH()

  if (!props.config)
    return

  mergeConfig()
}

async function initWH() {
  await nextTick()

  const { clientWidth, clientHeight } = percentPond.value

  state.width = clientWidth
  state.height = clientHeight
}

function mergeConfig() {
  state.mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config || {})
}
</script>

<style lang="less">
.dv-percent-pond {
  position: relative;
  display: flex;
  flex-direction: column;

  svg {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
  }

  polyline {
    transition: all 0.3s;
  }

  text {
    font-size: 25px;
    font-weight: bold;
    text-anchor: middle;
    dominant-baseline: middle;
  }
}
</style>
