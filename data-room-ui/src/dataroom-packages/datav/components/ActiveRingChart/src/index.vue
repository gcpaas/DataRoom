<template>
  <div class="dv-active-ring-chart">
    <div ref="activeRingChart" class="active-ring-chart-container" />
    <div class="active-ring-info">
      <div v-if="isDigitalFlop">
        <DigitalFlop :config="digitalFlop" />
      </div>
      <div v-else class="active-ring-name" :style="fontSize">
        {{ fixedDisplayValue }}
      </div>
      <div class="active-ring-name" :style="fontSize">
        {{ ringName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import Charts from '@jiaminghi/charts'
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'
import DigitalFlop from '../../DigitalFlop/src/index.vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
  isDigitalFlop: {
    type: Boolean,
    default: true,
  },
})
const activeRingChart = ref(null)
const state = reactive({
  defaultConfig: {
    /**
     * @description Ring radius
     * @type {string | number}
     * @default radius = '50%'
     * @example radius = '50%' | 100
     */
    radius: '50%',
    /**
     * @description Active ring radius
     * @type {string | number}
     * @default activeRadius = '55%'
     * @example activeRadius = '55%' | 110
     */
    activeRadius: '55%',
    /**
     * @description Ring data
     * @type {Array<object>}
     * @default data = [{ name: '', value: 0 }]
     */
    data: [{ name: '', value: 0 }],
    /**
     * @description Ring line width
     * @type {number}
     * @default lineWidth = 20
     */
    lineWidth: 20,
    /**
     * @description Active time gap (ms)
     * @type {number}
     * @default activeTimeGap = 3000
     */
    activeTimeGap: 3000,
    /**
     * @description Ring color (hex|rgb|rgba|color keywords)
     * @type {Array<string>}
     * @default color = [Charts Default Color]
     * @example color = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
     */
    color: [],
    /**
     * @description Text color
     * @type {string}
     * @default textColor = '#fff'
     */
    textColor: '#fff',
    /**
     * @description Digital flop style
     * @type {object}
     */
    digitalFlopStyle: {
      fontSize: 25,
      fill: '#fff',
    },
    /**
     * @description Digital flop toFixed
     * @type {number}
     */
    digitalFlopToFixed: 0,
    /**
     * @description percent number toFixed
     * @type {number}
     */
    numToFixed: 0,
    /**
     * @description Digital flop unit
     * @type {string}
     */
    digitalFlopUnit: '',
    /**
     * @description CRender animationCurve
     * @type {string}
     * @default animationCurve = 'easeOutCubic'
     */
    animationCurve: 'easeOutCubic',
    /**
     * @description CRender animationFrame
     * @type {string}
     * @default animationFrame = 50
     */
    animationFrame: 50,
    /**
     * @description showOriginValue
     * @type {boolean}
     * @default showOriginValue = false
     */
    showOriginValue: false,
  },

  mergedConfig: null,

  chart: null,

  activeIndex: 0,

  animationHandler: '',
})

const displayValue = computed(() => {
  if (!state.mergedConfig)
    return 0

  const { data, showOriginValue } = state.mergedConfig

  const value = data.map(({ value }) => value)

  let displayValueTemp

  if (showOriginValue) {
    displayValueTemp = value[state.activeIndex]
  }
  else {
    const sum = value.reduce((all, v) => all + v, 0)

    const percent = Number.parseFloat((value[state.activeIndex] / sum) * 100) || 0

    displayValueTemp = percent
  }

  return displayValueTemp
})

const fixedDisplayValue = computed(() => {
  if (!state.mergedConfig)
    return displayValue.value.toFixed(state.defaultConfig.numToFixed)
  const { numToFixed, showOriginValue } = state.mergedConfig
  return `${showOriginValue ? displayValue.value.toFixed(numToFixed) : `${displayValue.value.toFixed(numToFixed)}%`}`
})

const digitalFlop = computed(() => {
  if (!state.mergedConfig)
    return {}

  const {
    digitalFlopStyle,
    digitalFlopToFixed,
    showOriginValue,
    digitalFlopUnit,
  } = state.mergedConfig

  return {
    content: showOriginValue ? `{nt}${digitalFlopUnit}` : `{nt}${digitalFlopUnit || '%'}`,
    number: [displayValue.value],
    style: digitalFlopStyle,
    toFixed: digitalFlopToFixed,
  }
})

const ringName = computed(() => {
  if (!state.mergedConfig)
    return ''
  return state.mergedConfig.data[state.activeIndex].name
})
const fontSize = computed(() => {
  if (!state.mergedConfig)
    return ''

  return `font-size: ${state.mergedConfig.digitalFlopStyle.fontSize}px;`
})

const textColor = computed(() => {
  return props.config.textColor ? props.config.textColor : state.defaultConfig.textColor
})

watch(() => props.config, () => {
  clearTimeout(state.animationHandler)

  state.activeIndex = 0
  mergeConfig()

  setRingOption()
}, {
  deep: true,
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  clearTimeout(state.animationHandler)
})

function init() {
  initChart()

  mergeConfig()

  setRingOption()
}

function initChart() {
  state.chart = new Charts(activeRingChart.value)
}

function mergeConfig() {
  state.mergedConfig = deepMerge(
    deepClone(state.defaultConfig, true),
    props.config || {}
  )
}

function setRingOption() {
  const option = getRingOption()
  state.chart.setOption(option, true)
  ringAnimation()
}

function getRingOption() {
  const radius = getRealRadius()

  state.mergedConfig.data.forEach((dataItem) => {
    dataItem.radius = radius
  })

  return {
    series: [
      {
        type: 'pie',
        ...state.mergedConfig,
        outsideLabel: {
          show: false,
        },
      },
    ],
    color: state.mergedConfig.color,
  }
}

function getRealRadius(active = false) {
  const { radius, activeRadius, lineWidth } = state.mergedConfig

  const maxRadius = Math.min(...state.chart.render.area) / 2

  const halfLineWidth = lineWidth / 2

  let realRadius = active ? activeRadius : radius

  if (typeof realRadius !== 'number')
    realRadius = (Number.parseInt(realRadius) / 100) * maxRadius

  const insideRadius = realRadius - halfLineWidth
  const outSideRadius = realRadius + halfLineWidth

  return [insideRadius, outSideRadius]
}

function ringAnimation() {
  const radius = getRealRadius()
  const active = getRealRadius(true)

  const option = getRingOption()

  const { data } = option.series[0]

  data.forEach((dataItem, i) => {
    if (i === state.activeIndex)
      dataItem.radius = active
    else
      dataItem.radius = radius
  })
  state.chart.setOption(option, true)

  const { activeTimeGap } = option.series[0]
  state.animationHandler = setTimeout(() => {
    state.activeIndex += 1

    if (state.activeIndex >= data.length)
      state.activeIndex = 0

    ringAnimation()
  }, activeTimeGap)
}
</script>

<style lang="less">
.dv-active-ring-chart {
  position: relative;

  .active-ring-chart-container {
    width: 100%;
    height: 100%;
  }

  .active-ring-info {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .dv-digital-flop {
      width: 100px;
      height: 30px;
    }

    .active-ring-name {
      width: 100px;
      height: 30px;
      color: v-bind('textColor');
      text-align: center;
      vertical-align: middle;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
