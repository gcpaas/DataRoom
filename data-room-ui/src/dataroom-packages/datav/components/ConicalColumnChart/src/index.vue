<template>
  <div ref="conicalColumnChart" class="dv-conical-column-chart">
    <svg :width="width" :height="height">
      <g
        v-for="(item, i) in state.column"
        :key="i"
      >
        <path
          :d="item.d"
          :fill="state.mergedConfig.columnColor"
        />
        <text
          :fill="state.mergedConfig.textColor"
          :x="item.x"
          :y="height - 4"
        >
          {{ item.name }}
        </text>
        <image
          v-if="state.mergedConfig.img.length"
          :xlink:href="state.mergedConfig.img[i % state.mergedConfig.img.length]"
          :width="state.mergedConfig.imgSideLength"
          :height="state.mergedConfig.imgSideLength"
          :x="item.x - state.mergedConfig.imgSideLength / 2"
          :y="item.y - state.mergedConfig.imgSideLength"
        />
        <text
          v-if="state.mergedConfig.showValue"
          :fill="state.mergedConfig.textColor"
          :x="item.x"
          :y="item.textY"
        >
          {{ item.value }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
})
const conicalColumnChart = ref(null)
const { width, height } = autoResize(conicalColumnChart, onResize, afterAutoResizeMixinInit)

const state = reactive({
  defaultConfig: {
    /**
     * @description Chart data
     * @type {Array<object>}
     * @default data = []
     */
    data: [],
    /**
     * @description Chart img
     * @type {Array<string>}
     * @default img = []
     */
    img: [],
    /**
     * @description Chart font size
     * @type {number}
     * @default fontSize = 12
     */
    fontSize: 12,
    /**
     * @description Img side length
     * @type {number}
     * @default imgSideLength = 30
     */
    imgSideLength: 30,
    /**
     * @description Column color
     * @type {string}
     * @default columnColor = 'rgba(0, 194, 255, 0.4)'
     */
    columnColor: 'rgba(0, 194, 255, 0.4)',
    /**
     * @description Text color
     * @type {string}
     * @default textColor = '#fff'
     */
    textColor: '#fff',
    /**
     * @description Show value
     * @type {boolean}
     * @default showValue = false
     */
    showValue: false,
    /**
     * @description Auto sort by value
     * @type {boolean}
     * @default sort = true
     */
    sort: true,
  },

  mergedConfig: null,

  column: [],

})

const fontSize = computed(() => {
  return `${props.config.fontSize ? props.config.fontSize : state.defaultConfig.fontSize}px`
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

function calcData() {
  mergeConfig()

  initData()

  calcSVGPath()
}

function mergeConfig() {
  state.mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config || {})
}

function initData() {
  let { data } = state.mergedConfig
  const { sort } = state.mergedConfig

  data = deepClone(data, true)

  sort && data.sort(({ value: a }, { value: b }) => {
    if (a > b)
      return -1
    else if (a < b)
      return 1
    else
      return 0
  })

  const max = Math.max(...data.map(x => x.value))

  data = data.map(item => ({
    ...item,
    percent: max === 0 ? 0 : item.value / max,
  }))

  state.mergedConfig.data = data
}

function calcSVGPath() {
  const { imgSideLength, fontSize, data } = state.mergedConfig

  const itemNum = data.length
  const gap = width.value / (itemNum + 1)

  const useAbleHeight = height.value - imgSideLength - fontSize - 5
  const svgBottom = height.value - fontSize - 5

  state.column = data.map((item, i) => {
    const { percent } = item

    const middleXPos = gap * (i + 1)
    const leftXPos = gap * i
    const rightXpos = gap * (i + 2)

    const middleYPos = svgBottom - useAbleHeight * percent
    const controlYPos = useAbleHeight * percent * 0.6 + middleYPos

    const d = `
          M${leftXPos}, ${svgBottom}
          Q${middleXPos}, ${controlYPos} ${middleXPos},${middleYPos}
          M${middleXPos},${middleYPos}
          Q${middleXPos}, ${controlYPos} ${rightXpos},${svgBottom}
          L${leftXPos}, ${svgBottom}
          Z
        `

    const textY = (svgBottom + middleYPos) / 2 + fontSize / 2

    return {
      ...item,
      d,
      x: middleXPos,
      y: middleYPos,
      textY,
    }
  })
}
</script>

<style lang="less">
.dv-conical-column-chart {
  width: 100%;
  height: 100%;

  text {
    text-anchor: middle;
    font-size: v-bind('fontSize');
  }
}
</style>
