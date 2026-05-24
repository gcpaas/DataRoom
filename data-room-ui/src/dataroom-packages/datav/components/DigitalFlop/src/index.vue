<template>
  <div class="dv-digital-flop">
    <canvas ref="digitalFlop" />
  </div>
</template>

<script setup>
import CRender from '@jiaminghi/c-render'
import '@jiaminghi/charts/lib/extend/index'
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  config: {
    type: Object,
    default: () => {},
  },
})

const digitalFlop = ref(null)

const state = reactive({
  renderer: null,

  defaultConfig: {
    /**
     * @description Number for digital flop
     * @type {Array<number>}
     * @default number = []
     * @example number = [10]
     */
    number: [],
    /**
     * @description Content formatter
     * @type {string}
     * @default content = ''
     * @example content = '{nt}个'
     */
    content: '',
    /**
     * @description Number toFixed
     * @type {number}
     * @default toFixed = 0
     */
    toFixed: 0,
    /**
     * @description Text align
     * @type {string}
     * @default textAlign = 'center'
     * @example textAlign = 'center' | 'left' | 'right'
     */
    textAlign: 'center',
    /**
     * @description rowGap
     * @type {number}
         @default rowGap = 0
     */
    rowGap: 0,
    /**
     * @description Text style configuration
     * @type {object} {CRender Class Style}
     */
    style: {
      fontSize: 30,
      fill: '#3de7c9',
    },
    /**
     * @description Number formatter
     * @type {null | Function}
     */
    formatter: undefined,
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
  },

  mergedConfig: null,

  graph: null,
})

watch(() => props.config, () => {
  update()
}, { deep: true })

onMounted(() => {
  init()
})

function init() {
  initRender()

  mergeConfig()

  initGraph()
}

function initRender() {
  state.renderer = new CRender(digitalFlop.value)
}

function mergeConfig() {
  state.mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config || {})
}

function initGraph() {
  const shape = getShape()
  const style = getStyle()

  state.graph = state.renderer.add({
    name: 'numberText',
    animationCurve: state.mergedConfig.animationCurve,
    animationFrame: state.mergedConfig.animationFrame,
    shape,
    style,
  })
}

function getShape() {
  const { number, content, toFixed, textAlign, rowGap, formatter } = state.mergedConfig

  const [w, h] = state.renderer.area

  const position = [w / 2, h / 2]

  if (textAlign === 'left')
    position[0] = 0
  if (textAlign === 'right')
    position[0] = w

  return {
    number,
    content,
    toFixed,
    position,
    rowGap,
    formatter,
  }
}

function getStyle() {
  const { style, textAlign } = state.mergedConfig

  return deepMerge(style, {
    textAlign,
    textBaseline: 'middle',
  })
}

function update() {
  state.graph.animationEnd()

  mergeConfig()

  if (!state.graph)
    return

  const { animationCurve, animationFrame } = state.mergedConfig

  const shape = getShape()
  const style = getStyle()

  mergeShape(state.graph, shape)

  state.graph.animationCurve = animationCurve
  state.graph.animationFrame = animationFrame

  state.graph.animation('style', style, true)
  state.graph.animation('shape', shape)
}

function mergeShape(graph, shape) {
  const cacheNum = graph.shape.number.length
  const shapeNum = shape.number.length

  if (cacheNum !== shapeNum)
    graph.shape.number = shape.number
}
</script>

<style lang="less">
.dv-digital-flop {

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
