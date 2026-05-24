<template>
  <div class="dv-water-pond-level">
    <svg v-if="state.renderer">
      <defs>
        <linearGradient :id="state.gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            v-for="lc in state.svgBorderGradient" :key="lc[0]"
            :offset="lc[0]"
            :stop-color="lc[1]"
          />
        </linearGradient>
      </defs>

      <text
        v-if="state.renderer"
        :stroke="`url(#${state.gradientId})`"
        :fill="`url(#${state.gradientId})`"
        :x="state.renderer.area[0] / 2 + 8"
        :y="state.renderer.area[1] / 2 + 8"
      >
        {{ state.details }}
      </text>

      <ellipse
        v-if="!shape || shape === 'round'"
        :cx="state.renderer.area[0] / 2 + 8"
        :cy="state.renderer.area[1] / 2 + 8"
        :rx="state.renderer.area[0] / 2 + 5"
        :ry="state.renderer.area[1] / 2 + 5"
        :stroke="`url(#${state.gradientId})`"
      />

      <rect
        v-else
        x="2" y="2"
        :rx="shape === 'roundRect' ? 10 : 0"
        :ry="shape === 'roundRect' ? 10 : 0"
        :width="state.renderer.area[0] + 12"
        :height="state.renderer.area[1] + 12"
        :stroke="`url(#${state.gradientId})`"
      />
    </svg>

    <canvas ref="waterPondLevel" :style="`border-radius: ${radius};`" />
  </div>
</template>

<script setup>
import { deepClone, deepMerge, uuid } from '@/dataroom-packages/datav/utils'
import CRender from '@jiaminghi/c-render'

const props = defineProps({
  config: Object,
  default: () => ({}),
})
const id = uuid()
const waterPondLevel = ref(null)

const state = reactive({
  gradientId: `water-level-pond-${id}`,

  defaultConfig: {
    /**
     * @description Data
     * @type {Array<number>}
     * @default data = []
     * @example data = [60, 40]
     */
    data: [],
    /**
     * @description Shape of wanter level pond
     * @type {string}
     * @default shape = 'rect'
     * @example shape = 'rect' | 'roundRect' | 'round'
     */
    shape: 'rect',
    /**
     * @description Water wave number
     * @type {number}
     * @default waveNum = 3
     */
    waveNum: 3,
    /**
     * @description Water wave height (px)
     * @type {number}
     * @default waveHeight = 40
     */
    waveHeight: 40,
    /**
     * @description Wave opacity
     * @type {number}
     * @default waveOpacity = 0.4
     */
    waveOpacity: 0.4,
    /**
     * @description Colors (hex|rgb|rgba|color keywords)
     * @type {Array<string>}
     * @default colors = ['#00BAFF', '#3DE7C9']
     * @example colors = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
     */
    colors: ['#3DE7C9', '#00BAFF'],
    /**
     * @description Formatter
     * @type {string}
     * @default formatter = '{value}%'
     */
    formatter: '{value}%',
  },

  mergedConfig: {},

  renderer: null,

  svgBorderGradient: [],

  details: '',

  waves: [],

  animation: false,
})

const radius = computed(() => {
  const { shape } = state.mergedConfig

  if (shape === 'round')
    return '50%'

  if (shape === 'rect')
    return '0'

  if (shape === 'roundRect')
    return '10px'

  return '0'
})

const shape = computed(() => {
  const { shape } = state.mergedConfig

  if (!shape)
    return 'rect'

  return shape
})

watch(() => props.config, () => {
  state.renderer.delAllGraph()

  state.waves = []

  setTimeout(calcData, 0)
}, {
  deep: true,
})

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  state.renderer.delAllGraph()

  state.waves = []
})

function init() {
  initRender()

  if (!props.config)
    return

  calcData()
}

function initRender() {
  state.renderer = new CRender(waterPondLevel.value)
}

function calcData() {
  mergeConfig()

  calcSvgBorderGradient()

  calcDetails()

  addWave()

  animationWave()
}

function mergeConfig() {
  state.mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config)
}

function calcSvgBorderGradient() {
  const { colors } = state.mergedConfig

  const colorNum = colors.length

  const colorOffsetGap = 100 / (colorNum - 1)

  state.svgBorderGradient = colors.map((c, i) => [colorOffsetGap * i, c])
}

function calcDetails() {
  const { data, formatter } = state.mergedConfig

  if (!data.length) {
    state.details = ''

    return
  }

  const maxValue = Math.max(...data)

  state.details = formatter.replace('{value}', maxValue)
}

function addWave() {
  const shapes = getWaveShapes()
  const style = getWaveStyle()

  state.waves = shapes.map(shape => state.renderer.add({
    name: 'smoothline',
    animationFrame: 300,
    shape,
    style,
    drawed,
  }))
}

function getWaveShapes() {
  const { waveNum, waveHeight, data } = state.mergedConfig

  const [w, h] = state.renderer.area

  const pointsNum = waveNum * 4 + 4

  const pointXGap = w / waveNum / 2

  return data.map((v) => {
    let points = Array.from({ length: pointsNum }).fill(0).map((foo, j) => {
      const x = w - pointXGap * j

      const startY = (1 - v / 100) * h

      const y = j % 2 === 0 ? startY : startY - waveHeight

      return [x, y]
    })

    points = points.map(p => mergeOffset(p, [pointXGap * 2, 0]))

    return { points }
  })
}

function mergeOffset([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function getWaveStyle() {
  const h = state.renderer.area[1]

  return {
    gradientColor: state.mergedConfig.colors,
    gradientType: 'linear',
    gradientParams: [0, 0, 0, h],
    gradientWith: 'fill',
    opacity: state.mergedConfig.waveOpacity,
    translate: [0, 0],
  }
}

function drawed({ shape: { points } }, { ctx, area }) {
  const firstPoint = points[0]
  const lastPoint = points.slice(-1)[0]

  const h = area[1]

  ctx.lineTo(lastPoint[0], h)
  ctx.lineTo(firstPoint[0], h)

  ctx.closePath()

  ctx.fill()
}

async function animationWave(repeat = 1) {
  if (state.animation)
    return

  state.animation = true

  const w = state.renderer.area[0]

  state.waves.forEach((graph) => {
    graph.attr('style', { translate: [0, 0] })

    graph.animation('style', {
      translate: [w, 0],
    }, true)
  })

  await state.renderer.launchAnimation()

  state.animation = false

  if (!state.renderer.graphs.length)
    return

  animationWave(repeat + 1)
}
</script>

<style lang="less">
.dv-water-pond-level {
  position: relative;

  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
  }

  text {
    font-size: 25px;
    font-weight: bold;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  ellipse, rect {
    fill: none;
    stroke-width: 3;
  }

  canvas {
    margin-top: 8px;
    margin-left: 8px;
    width: calc(~"100% - 16px");
    height: calc(~"100% - 16px");
    box-sizing: border-box;
  }
}
</style>
