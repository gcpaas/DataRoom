<template>
  <div ref="scrollBoard" class="dv-scroll-board">
    <div v-if="state.header.length && state.mergedConfig" class="header" :style="`background-color: ${state.mergedConfig.headerBGC};`">
      <div
        v-for="(headerItem, i) in state.header"
        :key="`${headerItem}${i}`"
        class="header-item"
        :style="`
          height: ${state.mergedConfig.headerHeight}px;
          line-height: ${state.mergedConfig.headerHeight}px;
          width: ${state.widths[i]}px;
        `"
        :align="state.aligns[i]"
        v-html="headerItem"
      />
    </div>

    <div
      v-if="state.mergedConfig"
      class="rows"
      :style="`height: ${height - (state.header.length ? state.mergedConfig.headerHeight : 0)}px;`"
    >
      <div
        v-for="(row, ri) in state.rows"
        :key="`${row.toString()}${row.scroll}`"
        class="row-item"
        :style="`
          height: ${state.heights[ri]}px;
          line-height: ${state.heights[ri]}px;
          background-color: ${state.mergedConfig[row.rowIndex % 2 === 0 ? 'evenRowBGC' : 'oddRowBGC']};
        `"
      >
        <div
          v-for="(ceil, ci) in row.ceils"
          :key="`${ceil}${ri}${ci}`"
          class="ceil"
          :style="`width: ${state.widths[ci]}px;`"
          :align="state.aligns[ci]"
          @click="handleClick(ri, ci, row, ceil)"
          @mouseenter="handleHover(true, ri, ci, row, ceil)"
          @mouseleave="handleHover(false)"
          v-html="ceil"
        />
      </div>
    </div>
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

const emitEvent = defineEmits(['mouseover', 'click', 'getFirstRow'])

const scrollBoard = ref(null)
const { width, height } = autoResize(scrollBoard, onResize, afterAutoResizeMixinInit)

const state = reactive({
  defaultConfig: {
    /**
     * @description Board header
     * @type {Array<string>}
     * @default header = []
     * @example header = ['column1', 'column2', 'column3']
     */
    header: [],
    /**
     * @description Board data
     * @type {Array<Array>}
     * @default data = []
     */
    data: [],
    /**
     * @description Row num
     * @type {number}
     * @default rowNum = 5
     */
    rowNum: 5,
    /**
     * @description Header background color
     * @type {string}
     * @default headerBGC = '#00BAFF'
     */
    headerBGC: '#00BAFF',
    /**
     * @description Odd row background color
     * @type {string}
     * @default oddRowBGC = '#003B51'
     */
    oddRowBGC: '#003B51',
    /**
     * @description Even row background color
     * @type {string}
     * @default evenRowBGC = '#003B51'
     */
    evenRowBGC: '#0A2732',
    /**
     * @description Scroll wait time
     * @type {number}
     * @default waitTime = 2000
     */
    waitTime: 2000,
    /**
     * @description Header height
     * @type {number}
     * @default headerHeight = 35
     */
    headerHeight: 35,
    /**
     * @description Column width
     * @type {Array<number>}
     * @default columnWidth = []
     */
    columnWidth: [],
    /**
     * @description Column align
     * @type {Array<string>}
     * @default align = []
     * @example align = ['left', 'center', 'right']
     */
    align: [],
    /**
     * @description Show index
     * @type {boolean}
     * @default index = false
     */
    index: false,
    /**
     * @description index Header
     * @type {string}
     * @default indexHeader = '#'
     */
    indexHeader: '#',
    /**
     * @description Carousel type
     * @type {string}
     * @default carousel = 'single'
     * @example carousel = 'single' | 'page'
     */
    carousel: 'single',
    /**
     * @description Pause scroll when mouse hovered
     * @type {boolean}
     * @default hoverPause = true
     * @example hoverPause = true | false
     */
    hoverPause: true,
  },

  mergedConfig: null,

  header: [],

  rowsData: [],

  rows: [],

  widths: [],

  heights: [],

  avgHeight: 0,

  aligns: [],

  animationIndex: 0,

  animationHandler: '',

  updater: 0,

  needCalc: false,
})

watch(() => props.config, () => {
  stopAnimation()
  // 此处打开后，config发生变化时，会从第一行开始重新轮播
  // state.animationIndex = 0

  calcData()
}, { deep: true })

onUnmounted(() => {
  stopAnimation()
})

defineExpose({
  updateRows,
})

function handleClick(ri, ci, row, ceil) {
  const { ceils, rowIndex } = row
  emitEvent('click', {
    row: ceils,
    ceil,
    rowIndex,
    columnIndex: ci,
  })
}

function handleHover(enter, ri, ci, row, ceil) {
  if (enter) {
    const { ceils, rowIndex } = row
    emitEvent('mouseover', {
      row: ceils,
      ceil,
      rowIndex,
      columnIndex: ci,
    })
  }
  if (!state.mergedConfig.hoverPause)
    return

  if (enter)
    stopAnimation()
  else
    animation(true)
}

function afterAutoResizeMixinInit() {
  calcData()
}

function onResize() {
  if (!state.mergedConfig)
    return

  calcWidths()

  calcHeights()
}

function calcData() {
  mergeConfig()

  calcHeaderData()

  calcRowsData()

  calcWidths()

  calcHeights()

  calcAligns()

  animation(true)
}

function mergeConfig() {
  state.mergedConfig = deepMerge(deepClone(state.defaultConfig, true), props.config || {})
}

function calcHeaderData() {
  let { header } = state.mergedConfig
  const { index, indexHeader } = state.mergedConfig
  if (!header.length) {
    header = []

    return
  }

  header = [...header]

  if (index)
    header.unshift(indexHeader)

  state.header = header
}

function calcRowsData() {
  let { data } = state.mergedConfig
  const { index, headerBGC, rowNum } = state.mergedConfig
  if (index) {
    data = data.map((row, i) => {
      row = [...row]

      const indexTag = `<span class="index" style="background-color: ${headerBGC};">${i + 1}</span>`

      row.unshift(indexTag)

      return row
    })
  }

  data = data.map((ceils, i) => ({ ceils, rowIndex: i }))

  const rowLength = data.length

  if (rowLength > rowNum && rowLength < 2 * rowNum)
    data = [...data, ...data]

  data = data.map((d, i) => ({ ...d, scroll: i }))

  state.rowsData = data
  state.rows = data
}

function calcWidths() {
  const { columnWidth, header } = state.mergedConfig

  const usedWidth = columnWidth.reduce((all, w) => all + w, 0)

  let columnNum = 0
  if (state.rowsData[0])
    columnNum = state.rowsData[0].ceils.length
  else if (header.length)
    columnNum = header.length

  const avgWidth = (width.value - usedWidth) / (columnNum - columnWidth.length)

  const widths = Array.from({ length: columnNum }).fill(avgWidth)

  state.widths = deepMerge(widths, columnWidth)
}

function calcHeights(onresize = false) {
  const { headerHeight, rowNum, data } = state.mergedConfig

  let allHeight = height.value

  if (state.header.length)
    allHeight -= headerHeight

  const avgHeight = allHeight / rowNum

  state.avgHeight = avgHeight

  if (!onresize)
    state.heights = Array.from({ length: data.length }).fill(avgHeight)
}

function calcAligns() {
  const columnNum = state.header.length

  const aligns = Array.from({ length: columnNum }).fill('left')

  const { align } = state.mergedConfig

  state.aligns = deepMerge(aligns, align)
}

async function animation(start = false) {
  if (state.needCalc) {
    calcRowsData()
    calcHeights()
    state.needCalc = false
  }

  const { waitTime, carousel, rowNum } = state.mergedConfig
  const { updater } = state

  const rowLength = state.rowsData.length

  if (rowNum >= rowLength)
    return

  if (start)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  if (updater !== state.updater)
    return

  const animationNum = carousel === 'single' ? 1 : rowNum

  const rows = state.rowsData.slice(state.animationIndex)
  rows.push(...state.rowsData.slice(0, state.animationIndex))

  state.rows = rows.slice(0, carousel === 'page' ? rowNum * 2 : rowNum + 1)
  state.heights = Array.from({ length: rowLength }).fill(state.avgHeight)

  await new Promise(resolve => setTimeout(resolve, 300))
  if (updater !== state.updater)
    return

  state.heights.splice(0, animationNum, ...Array.from({ length: animationNum }).fill(0))

  state.animationIndex += animationNum

  const back = state.animationIndex - rowLength
  if (back >= 0)
    state.animationIndex = back

  // state.animationIndex = animationIndex
  state.animationHandler = setTimeout(animation, waitTime - 300)

  emitEvent('getFirstRow', rows[1])
}

function stopAnimation() {
  state.updater = (state.updater + 1) % 999999
  if (!state.animationHandler)
    return

  clearTimeout(state.animationHandler)
}

function updateRows(rows, animationIndex) {
  state.mergedConfig = {
    ...state.mergedConfig,
    data: [...rows],
  }

  state.needCalc = true

  if (typeof animationIndex === 'number')
    state.animationIndex = animationIndex
  if (!state.animationHandler)
    animation(true)
}
</script>

<style lang="less">
.dv-scroll-board {
  position: relative;
  width: 100%;
  height: 100%;
  color: #fff;

  .text {
    padding: 0 10px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header {
    display: flex;
    flex-direction: row;
    font-size: 15px;

    .header-item {
      .text;
      transition: all 0.3s;
    }
  }

  .rows {
    overflow: hidden;

    .row-item {
      display: flex;
      font-size: 14px;
      transition: all 0.3s;
    }

    .ceil {
      .text;
    }

    .index {
      border-radius: 3px;
      padding: 0px 3px;
    }
  }
}
</style>
