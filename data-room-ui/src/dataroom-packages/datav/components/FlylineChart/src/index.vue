<template>
  <div
    ref="flylineChart"
    class="dv-flyline-chart"
    :style="`background-image: url(${state.mergedConfig ? state.mergedConfig.bgImgUrl : ''})`"
    @click="consoleClickPos"
  >
    <svg v-if="state.mergedConfig" :width="width" :height="height">
      <defs>
        <radialGradient
          :id="state.gradientId"
          cx="50%" cy="50%" r="50%"
        >
          <stop
            offset="0%" stop-color="#fff"
            stop-opacity="1"
          />
          <stop
            offset="100%" stop-color="#fff"
            stop-opacity="0"
          />
        </radialGradient>

        <radialGradient
          :id="state.gradient2Id"
          cx="50%" cy="50%" r="50%"
        >
          <stop
            offset="0%" stop-color="#fff"
            stop-opacity="0"
          />
          <stop
            offset="100%" stop-color="#fff"
            stop-opacity="1"
          />
        </radialGradient>

        <circle
          v-if="state.paths[0]"
          :id="`circle${state.paths[0].toString()}`"
          :cx="state.paths[0][2][0]"
          :cy="state.paths[0][2][1]"
        >
          <animate
            attributeName="r"
            :values="`1;${state.mergedConfig.halo.radius}`"
            :dur="`${state.mergedConfig.halo.duration / 10}s`"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0"
            :dur="`${state.mergedConfig.halo.duration / 10}s`"
            repeatCount="indefinite"
          />
        </circle>
      </defs>

      <image
        v-if="state.paths[0]"
        :xlink:href="state.mergedConfig.centerPointImg.url"
        :width="state.mergedConfig.centerPointImg.width"
        :height="state.mergedConfig.centerPointImg.height"
        :x="state.paths[0][2][0] - state.mergedConfig.centerPointImg.width / 2"
        :y="state.paths[0][2][1] - state.mergedConfig.centerPointImg.height / 2"
      />

      <mask :id="`maskhalo${state.paths[0].toString()}`">
        <use
          v-if="state.paths[0]"
          :xlink:href="`#circle${state.paths[0].toString()}`"
          :fill="`url(#${state.gradient2Id})`"
        />
      </mask>

      <use
        v-if="state.paths[0] && state.mergedConfig.halo.show"
        :xlink:href="`#circle${state.paths[0].toString()}`"
        :fill="state.mergedConfig.halo.color"
        :mask="`url(#maskhalo${state.paths[0].toString()})`"
      />

      <g
        v-for="(path, i) in state.paths"
        :key="i"
      >
        <defs>
          <path
            :id="`path${path.toString()}`"
            :ref="`path${i}`"
            :d="`M${path[0].toString()} Q${path[1].toString()} ${path[2].toString()}`"
            fill="transparent"
          />
        </defs>

        <use
          :xlink:href="`#path${path.toString()}`"
          :stroke-width="state.mergedConfig.lineWidth"
          :stroke="state.mergedConfig.orbitColor"
        />

        <use
          v-if="state.lengths[i]"
          :xlink:href="`#path${path.toString()}`"
          :stroke-width="state.mergedConfig.lineWidth"
          :stroke="state.mergedConfig.flylineColor"
          :mask="`url(#mask${state.unique}${path.toString()})`"
        >
          <animate
            attributeName="stroke-dasharray"
            :from="`0, ${state.lengths[i]}`"
            :to="`${state.lengths[i]}, 0`"
            :dur="state.times[i] || 0"
            repeatCount="indefinite"
          />
        </use>

        <mask :id="`mask${state.unique}${path.toString()}`">
          <circle cx="0" cy="0" :r="state.mergedConfig.flylineRadius" :fill="`url(#${state.gradientId})`">
            <animateMotion
              :dur="state.times[i] || 0"
              :path="`M${path[0].toString()} Q${path[1].toString()} ${path[2].toString()}`"
              rotate="auto"
              repeatCount="indefinite"
            />
          </circle>
        </mask>

        <image
          :xlink:href="state.mergedConfig.pointsImg.url"
          :width="state.mergedConfig.pointsImg.width"
          :height="state.mergedConfig.pointsImg.height"
          :x="path[0][0] - state.mergedConfig.pointsImg.width / 2"
          :y="path[0][1] - state.mergedConfig.pointsImg.height / 2"
        />

        <text
          :style="`fontSize:${state.mergedConfig.text.fontSize}px;`"
          :fill="state.mergedConfig.text.color"
          :x="path[0][0] + state.mergedConfig.text.offset[0]"
          :y="path[0][1] + state.mergedConfig.text.offset[1]"
        >
          {{ state.texts[i] }}
        </text>

      </g>
    </svg>
  </div>
</template>

<script setup>
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { deepClone, deepMerge, getPointDistance, randomExtend, uuid } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
  dev: {
    type: Boolean,
    default: false,
  },
})

const id = uuid()
const flylineChart = ref(null)

const { width, height } = autoResize(flylineChart, onResize, afterAutoResizeMixinInit)

const state = reactive({
  unique: Math.random(),
  maskId: `flyline-mask-id-${id}`,
  maskCircleId: `mask-circle-id-${id}`,
  gradientId: `gradient-id-${id}`,
  gradient2Id: `gradient2-id-${id}`,

  defaultConfig: {
    /**
     * @description Flyline chart center point
     * @type {Array<number>}
     * @default centerPoint = [0, 0]
     */
    centerPoint: [0, 0],
    /**
     * @description Flyline start points
     * @type {Array<Array<number>>}
     * @default points = []
     * @example points = [[10, 10], [100, 100]]
     */
    points: [],
    /**
     * @description Flyline width
     * @type {number}
     * @default lineWidth = 1
     */
    lineWidth: 1,
    /**
     * @description Orbit color
     * @type {string}
     * @default orbitColor = 'rgba(103, 224, 227, .2)'
     */
    orbitColor: 'rgba(103, 224, 227, .2)',
    /**
     * @description Flyline color
     * @type {string}
     * @default orbitColor = '#ffde93'
     */
    flylineColor: '#ffde93',
    /**
     * @description K value
     * @type {number}
     * @default k = -0.5
     * @example k = -1 ~ 1
     */
    k: -0.5,
    /**
     * @description Flyline curvature
     * @type {number}
     * @default curvature = 5
     */
    curvature: 5,
    /**
     * @description Flyline radius
     * @type {number}
     * @default flylineRadius = 100
     */
    flylineRadius: 100,
    /**
     * @description Flyline animation duration
     * @type {Array<number>}
     * @default duration = [20, 30]
     */
    duration: [20, 30],
    /**
     * @description Relative points position
     * @type {boolean}
     * @default relative = true
     */
    relative: true,
    /**
     * @description Back ground image url
     * @type {string}
     * @default bgImgUrl = ''
     * @example bgImgUrl = './img/bg.jpg'
     */
    bgImgUrl: '',
    /**
     * @description Text configuration
     * @type {object}
     */
    text: {
      /**
       * @description Text offset
       * @type {Array<number>}
       * @default offset = [0, 15]
       */
      offset: [0, 15],
      /**
       * @description Text color
       * @type {string}
       * @default color = '#ffdb5c'
       */
      color: '#ffdb5c',
      /**
       * @description Text font size
       * @type {number}
       * @default fontSize = 12
       */
      fontSize: 12,
    },
    /**
     * @description Halo configuration
     * @type {object}
     */
    halo: {
      /**
       * @description Weather to show halo
       * @type {boolean}
       * @default show = true
       * @example show = true | false
       */
      show: true,
      /**
       * @description Halo animation duration (10 = 1s)
       * @type {number}
       * @default duration = 30
       */
      duration: 30,
      /**
       * @description Halo color
       * @type {string}
       * @default color = '#fb7293'
       */
      color: '#fb7293',
      /**
       * @description Halo max radius
       * @type {number}
       * @default radius = 120
       */
      radius: 120,
    },
    /**
     * @description Center point img configuration
     * @type {object}
     */
    centerPointImg: {
      /**
       * @description Center point img width
       * @type {number}
       * @default width = 40
       */
      width: 40,
      /**
       * @description Center point img height
       * @type {number}
       * @default height = 40
       */
      height: 40,
      /**
       * @description Center point img url
       * @type {string}
       * @default url = ''
       */
      url: '',
    },
    /**
     * @description Points img configuration
     * @type {object}
     * @default radius = 120
     */
    pointsImg: {
      /**
       * @description Points img width
       * @type {number}
       * @default width = 15
       */
      width: 15,
      /**
       * @description Points img height
       * @type {number}
       * @default height = 15
       */
      height: 15,
      /**
       * @description Points img url
       * @type {string}
       * @default url = ''
       */
      url: '',
    },
  },

  mergedConfig: null,

  paths: [],
  lengths: [],
  times: [],
  texts: [],
})

let instance

onMounted(() => {
  instance = getCurrentInstance()
})

watch(() => props.config, () => {
  calcData()
}, {
  deep: true,
})

function afterAutoResizeMixinInit() {
  calcData()
}

function onResize() {
  calcData()
}

async function calcData() {
  mergeConfig()

  createFlylinePaths()

  await calcLineLengths()

  calcTimes()

  calcTexts()
}

function mergeConfig() {
  const mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config || {})

  const { points } = mergedConfig

  mergedConfig.points = points.map((item) => {
    if (Array.isArray(item))
      return { position: item, text: '' }

    return item
  })

  state.mergedConfig = mergedConfig
}

function createFlylinePaths() {
  let { centerPoint, points } = state.mergedConfig
  const { relative } = state.mergedConfig

  points = points.map(({ position }) => position)

  if (relative) {
    centerPoint = [width.value * centerPoint[0], height.value * centerPoint[1]]
    points = points.map(([x, y]) => [width.value * x, height.value * y])
  }

  state.paths = points.map(point => getPath(centerPoint, point))
}

function getPath(center, point) {
  const controlPoint = getControlPoint(center, point)

  return [point, controlPoint, center]
}

function getControlPoint([sx, sy], [ex, ey]) {
  const { curvature, k } = state.mergedConfig

  const [mx, my] = [(sx + ex) / 2, (sy + ey) / 2]

  const distance = getPointDistance([sx, sy], [ex, ey])

  const targetLength = distance / curvature
  const disDived = targetLength / 2

  let [dx, dy] = [mx, my]

  do {
    dx += disDived
    dy = getKLinePointByx(k, [mx, my], dx)[1]
  } while (getPointDistance([mx, my], [dx, dy]) < targetLength)

  return [dx, dy]
}

function getKLinePointByx(k, [lx, ly], x) {
  const y = ly - k * lx + k * x

  return [x, y]
}

async function calcLineLengths() {
  await nextTick()
  state.lengths = state.paths.map((foo, i) => instance.proxy.$refs[`path${i}`][0].getTotalLength())
}

function calcTimes() {
  const { duration, points } = state.mergedConfig

  state.times = points.map(() => randomExtend(...duration) / 10)
}

function calcTexts() {
  const { points } = state.mergedConfig

  state.texts = points.map(({ text }) => text)
}

function consoleClickPos({ offsetX, offsetY }) {
  if (!props.dev)
    return

  const relativeX = (offsetX / width.value).toFixed(2)
  const relativeY = (offsetY / height.value).toFixed(2)

  console.warn(`dv-flyline-chart DEV: \n Click Position is [${offsetX}, ${offsetY}] \n Relative Position is [${relativeX}, ${relativeY}]`)
}
</script>

<style lang="less">
.dv-flyline-chart {
  display: flex;
  flex-direction: column;
  background-size: 100% 100%;

  polyline {
    transition: all 0.3s;
  }

  text {
    text-anchor: middle;
    dominant-baseline: middle;
  }
}
</style>
