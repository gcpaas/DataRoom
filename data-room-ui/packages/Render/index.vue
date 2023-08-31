<template>
  <div
    ref="bs-render-wrap"
    :key="`${pageInfo.pageConfig.w}${pageInfo.pageConfig.h}`"
    class="bs-render-wrap design-drag-wrap render-theme-wrap"
    :style="{
      width: pageInfo.pageConfig.w + 'px',
      height: pageInfo.pageConfig.h + 'px',
      backgroundColor:pageInfo.pageConfig.customTheme ==='dark' ? pageInfo.pageConfig.bgColor : pageInfo.pageConfig.lightBgColor,
      backgroundImage:pageInfo.pageConfig.customTheme ==='dark' ? `url(${pageInfo.pageConfig.bg})`:`url(${pageInfo.pageConfig.lightBg})`
    }"
    @drop="drop($event)"
    @dragover.prevent
  >
    <vdr
      v-for="chart in chartList"
      :id="chart.code"
      :key="chart.updateKey || chart.code"
      class="drag-item"
      :class="{
        'multiple-selected': activeCodes.includes(chart.code),
      }"
      :scale-ratio="scale"
      :x="chart.x"
      :y="chart.y"
      :w="chart.w"
      :h="chart.h"
      :min-width="10"
      :min-height="10"
      :draggable="!chart.locked"
      :resizable="!chart.locked"
      :parent="true"
      :debug="false"
      :is-conflict-check="false"
      :snap="true"
      :snap-tolerance="2"
      :style="{
        zIndex: chart.z || 0,
      }"
      :grid="[1,1]"
      @activated="activated(...arguments, chart)"
      @dragging="onDrag(...arguments, chart)"
      @resizing="onResize(...arguments, chart)"
      @resizestop="resizestop(...arguments, chart)"
      @dragstop="dragstop(...arguments, chart)"
      @refLineParams="getRefLineParams"
      @mouseleave.native="resetPresetLineDelay"
    >
      <Configuration
        v-if="isInit"
        :config="chart"
        @openRightPanel="openRightPanel"
      >
        <RenderCard
          :ref="'RenderCard' + chart.code"
          :config="chart"
        />
      </Configuration>
    </vdr>
    <span
      v-for="(vl, index) in vLine"
      v-show="vl.display"
      :key="index + 'vLine'"
      class="ref-line v-line"
      :style="{ left: vl.position, top: vl.origin, height: vl.lineLength }"
    />
    <span
      v-for="(hl, index) in hLine"
      v-show="hl.display"
      :key="index + 'hLine'"
      class="ref-line h-line"
      :style="{ top: hl.position, left: hl.origin, width: hl.lineLength }"
    />
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import RenderCard from './RenderCard.vue'
import Configuration from './Configuration.vue'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import vdr from 'vue-draggable-resizable-gorkys'
import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
import { randomString } from '../js/utils'
import { compile } from 'tiny-sass-compiler/dist/tiny-sass-compiler.esm-browser.prod.js'
import plotList, { getCustomPlots } from '../G2Plots/plotList'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'

export default {
  name: 'BigScreenRender',
  components: {
    RenderCard,
    Configuration,
    vdr
  },
  props: {
    ruleKey: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      vLine: [],
      hLine: [],
      themeCss: '',
      // 临时冻结拖拽
      freeze: false,
      plotList,
      rawChart: []
    }
  },
  computed: {
    ...mapState({
      pageConfig: (state) => state.bigScreen.pageInfo.pageConfig,
      pageInfo: (state) => state.bigScreen.pageInfo,
      chartList: (state) => state.bigScreen.pageInfo.chartList,
      activeCode: (state) => state.bigScreen.activeCode,
      activeCodes: (state) => state.bigScreen.activeCodes,
      hoverCode: (state) => state.bigScreen.hoverCode,
      themeJson: (state) => state.bigScreen.pageInfo.pageConfig.themeJson,
      isInit: (state) => !state.bigScreen.pageLoading,
      scale: (state) => state.bigScreen.zoom / 100
    })
  },
  watch: {
    pageConfig: {
      handler (pageConfig) {
        this.$nextTick(() => {
          const style = document.createElement('style')
          if (
            pageConfig &&
            pageConfig.themeJson &&
            pageConfig.themeJson.themeCss
          ) {
            const themeCss = pageConfig.themeJson.themeCss
            if (themeCss) {
              const themeStr = compile(themeCss).code
              style.type = 'text/css'
              style.innerText = themeStr
              document.getElementsByTagName('head')[0].appendChild(style)
            }
          }
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.styleSet()
    this.plotList = [...this.plotList, ...getCustomPlots()]
  },
  methods: {
    ...mapMutations('bigScreen', [
      'changeLayout',
      'changeActiveCode',
      'changeChartConfig',
      'changeActiveItemConfig',
      'changeActiveItemWH',
      'addItem',
      'delItem',
      'resetPresetLine',
      'changeGridShow',
      'setPresetLine',
      'saveTimeLine'
    ]),
    // 获取到后端传来的主题样式并进行修改
    styleSet () {
      const style = document.createElement('style')
      if (this.themeJson && this.themeJson.themeCss) {
        const styleStr = this.themeJson.themeCss
        const themeCss = compile(styleStr).code
        style.type = 'text/css'
        style.innerText = themeCss
        document.getElementsByTagName('head')[0].appendChild(style)
      } else {
        style.remove()
      }
    },
    resetPresetLineDelay () {
      setTimeout(() => {
        this.resetPresetLine()
      }, 500)
    },
    // 点击当前组件时打开右侧面板
    openRightPanel (config) {
      this.$emit('openRightPanel', config)
    },
    drop (e) {
      e.preventDefault()
      // 解决：火狐拖放后，总会默认打开百度搜索，如果是图片，则会打开图片的问题。
      e.stopPropagation()
      const transferData = e.dataTransfer.getData('dragComponent')
      if (transferData) {
        this.addChart(transferData, { x: e?.x, y: e?.y })
      }
    },
    /**
     * 改变组件大小
     * @param x
     * @param y
     * @param width
     * @param height
     * @param chart
     */
    onResize (x, y, width, height, chart) {
      chart.x = x
      chart.y = y
      chart.w = width
      chart.h = height
      this.changeGridShow(true)
      this.setPresetLine({
        ...chart
      })
    },
    /**
     *
     * @param x
     * @param y
     * @param chart
     */
    onDrag (x, y, chart) {
      // 防止事件冒泡
      event.stopPropagation()
      if (chart.group) {
        // 查找和自己是一个组合的组件
        this.dragGroupChart(x, y, chart)
      } else {
        chart.x = x
        chart.y = y
      }
      this.changeGridShow(true)
      this.setPresetLine({
        ...chart
      })
    },
    resizestop (left, top, width, height, chart) {
      this.changeChartConfig({
        ...chart,
        w: width,
        h: height,
        x: left,
        y: top
      })
      this.changeActiveItemConfig({
        ...chart,
        w: width,
        h: height,
        x: left,
        y: top
      })
      if (chart.code === this.activeCode) {
        this.changeActiveItemWH({
          code: chart.code,
          w: width,
          h: height
        })
      }
      this.saveTimeLine(`改变${chart?.title}大小`)
      this.changeGridShow(false)
    },
    activated (chart) {
      this.rawChart = cloneDeep(chart)
    },
    dragstop (left, top, chart) {
      if (!this.freeze) {
        if (this.rawChart.x !== left || this.rawChart.y !== top) {
          this.changeChartConfig({
            ...chart,
            x: left,
            y: top
          })
          this.changeActiveItemConfig({
            ...chart,
            x: left,
            y: top
          })
          if (chart.code === this.activeCode) {
            this.changeActiveItemWH({
              code: chart.code,
              x: left,
              y: top
            })
          }
          this.rawChart = cloneDeep(chart)
        }
      } else {
        const index = this.chartList.findIndex(
          (_chart) => _chart.code === chart.code
        )
        this.$set(this.chartList, index, chart)
        this.changeChartConfig({
          ...chart,
          updateKey: new Date().getTime()
        })
      }
      this.changeGridShow(false)
      this.freeze = false
      this.saveTimeLine(`拖拽${chart?.title}`)
    },
    // 辅助线
    getRefLineParams (params) {
      const { vLine, hLine } = params
      this.vLine = vLine
      this.hLine = hLine
    },
    // 新增元素
    addChart (chart, position, isComponent) {
      const { left, top } = this.$el.getBoundingClientRect()
      const _chart = !chart.code ? JSON.parse(chart) : chart
      let option = _chart.option
      if (_chart.type === 'customComponent') {
        option = {
          ...this.plotList?.find((plot) => plot.name === _chart.name)?.option,
          theme: this.pageConfig.customTheme === 'dark' ? 'transparent' : 'light'
        }
      }
      const config = {
        ..._chart,
        x: parseInt(!chart.code
          ? (position.x - left - _chart.offsetX) / this.scale
          : position.x),
        y: parseInt(!chart.code
          ? (position.y - top - _chart.offsetX) / this.scale
          : position.y),
        width: 200 * this.scale,
        height: 200 * this.scale,
        code: !chart.code ? randomString(8) : chart.code,
        option
      }
      config.key = config.code
      // isComponent = false 从左侧新增时需要初始化theme的内容
      // isComponent = true从组件库添加自定义组件时不用初始化
      if (!isComponent) {
        config.theme = settingToTheme(config, 'dark')
        config.theme = settingToTheme(config, 'light')
      }
      this.addItem(config)
    },
    addSourceChart (chart, position) {
      const { left, top } = this.$el.getBoundingClientRect()
      const _chart = JSON.parse(chart)
      let option = _chart.option
      if (_chart.type === 'customComponent') {
        option = {
          ...this.plotList?.find((plot) => plot.name === _chart.name)?.option,
          theme: this.pageConfig.customTheme === 'dark' ? 'transparent' : 'light'
        }
      }
      const config = {
        ..._chart,
        x: parseInt((position.x - left) / this.scale),
        y: parseInt((position.y - top) / this.scale),
        width: 200 * this.scale,
        height: 200 * this.scale,
        code: randomString(8),
        option
      }
      config.key = config.code
      this.addItem(config)
    },
    /**
     * 拖拽相同组合的组件
     * @param x 组合元素当前x
     * @param y 组合元素当前y
     * @param chart
     */
    dragGroupChart (x, y, chart) {
      if (chart.group) {
        const diffX = x - chart.x
        const diffY = y - chart.y
        const group = chart.group
        // 找到相同group的组件，并找到边界
        const groupChartList = this.chartList.filter(
          (groupChart) => groupChart.group === group
        )
        const groupMinX = Math.min(
          ...groupChartList?.map((groupChart) => groupChart.x + diffX)
        )
        const groupMinY = Math.min(
          ...groupChartList?.map((groupChart) => groupChart.y + diffY)
        )
        const groupMaxX = Math.max(
          ...groupChartList?.map(
            (groupChart) => groupChart.x + diffX + groupChart.w
          )
        )
        const groupMaxY = Math.max(
          ...groupChartList?.map(
            (groupChart) => groupChart.y + diffY + groupChart.h
          )
        )
        // 如果其中某个组件超出画布，则不移动 (此处无法阻止移动，故在拖拽结束后重置位置)
        if (
          (groupMinX <= 0 ||
            groupMinY <= 0 ||
            groupMaxX >= this.pageConfig.w ||
            groupMaxY >= this.pageConfig.h) &&
          // 偏移的绝对值要大于0
          (Math.abs(diffX) > 0 || Math.abs(diffY) > 0)
        ) {
          this.freeze = true
          return
        }

        // 移动相应的diff距离
        groupChartList?.map((groupChart) => {
          this.changeChartConfig({
            ...groupChart,
            x: groupChart.x + diffX,
            y: groupChart.y + diffY
          })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.bs-render-wrap {
  position: relative;
  background-size: cover;
  .drag-item {
    cursor: move;
  }

  ::v-deep .vdr {
    border: none;
  }
  .h-line {
    border-bottom: 1px dashed #0089d0;
  }
  .v-line {
    border-left: 1px dashed #0089d0;
  }
  .ref-line {
    background-color: transparent;
  }
}
.design-drag-wrap {
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.5);
}
.multiple-selected {
  border: 1px dashed #fff !important;
}
</style>
