<template>
  <div
    ref="bs-render-wrap"
    :key="`${pageInfo.pageConfig.w}${pageInfo.pageConfig.h}`"
    class="bs-render-wrap design-drag-wrap render-theme-wrap"
    :style="{
      width: pageInfo.pageConfig.w + 'px',
      height: pageInfo.pageConfig.h + 'px',
      backgroundColor:pageInfo.pageConfig.customTheme ==='light' ? pageInfo.pageConfig.lightBgColor:pageInfo.pageConfig.bgColor ,
      backgroundImage:pageInfo.pageConfig.customTheme ==='light' ? `url(${getCoverPicture(pageInfo.pageConfig.lightBg)})`:`url(${getCoverPicture(pageInfo.pageConfig.bg)})`
    }"
    @drop="drop($event)"
    @dragover.prevent
    @click="handleClickOutside($event)"
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
      :snap-tolerance="snapTolerance"
      :style="{
        zIndex: chart.z || 0,
      }"
      :perspective="parseInt(`${chart.perspective == undefined ? 0 : chart.perspective}`)"
      :transform="`skew(${chart.skewX == undefined ? 0 : chart.skewX}deg, ${chart.skewY == undefined? 0 : chart.skewY}deg) rotateX(${chart.rotateX == undefined ? 0 : chart.rotateX}deg) rotateY(${chart.rotateY == undefined ? 0 : chart.rotateY}deg)  rotateZ(${chart.rotateZ == undefined ? 0 : chart.rotateZ}deg)`"
      :grid="[1,1]"
      :handles="handlesList"
      class-name-handle="bs-handle-class"
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
        @openDataViewDialog="openDataViewDialog"
      >
        <RenderCard
          :ref="'RenderCard' + chart.code"
          :config="chart"
          @styleHandler="styleHandler"
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
import vdr from '@gcpaas/vue-draggable-resizable-gorkys'
import 'gc-vue-draggable-resizable/dist/VueDraggableResizable.css'
import { randomString } from '../js/utils'
import { compile } from 'tiny-sass-compiler/dist/tiny-sass-compiler.esm-browser.prod.js'
import plotList, { getCustomPlots } from '../G2Plots/plotList'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import { getFileUrl } from 'data-room-ui/js/utils/file'
import { customDeserialize } from 'data-room-ui/js/utils/jsonSerialize.js'

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
      handlesList: ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'], // 缩放手柄的数组
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
      scale: (state) => state.bigScreen.zoom / 100,
      snapTolerance: (state) => state.bigScreen.snapTolerance
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
      'saveTimeLine',
      'changeActiveCodes'
    ]),
    // 判断鼠标点击的是画布中的高亮元素（被框选的）还是非高亮元素或者空白区域
    // 如果是高亮元素则不会取消高亮状态，如果不是则取消高亮状态
    handleClickOutside (event) {
      // 获取被点击的元素
      const clickedElement = event.target
      const elementToHighlights = []
      // 获取需要高亮的元素的引用
      for (const code of this.activeCodes) {
        if (this.$refs['RenderCard' + code] && this.$refs['RenderCard' + code].length && this.$refs['RenderCard' + code][0]) {
          elementToHighlights.push(this.$refs['RenderCard' + code][0])
        }
      }

      const isElementInHighlights = elementToHighlights.some((elementToHighlight) => {
        return elementToHighlight?.$el?.contains(clickedElement)
      })
      if (!isElementInHighlights) {
        this.changeActiveCodes([])
      }
    },
    // 切换主题时针对远程组件触发样式修改的方法
    styleHandler (config) {
      this.$nextTick(() => {
        this.$refs['RenderCard' + config.code][0]?.$refs[
          config.code
        ]?.changeStyle(cloneDeep(config), true)
      })
    },
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
    // 查看数据
    openDataViewDialog (config) {
      this.$emit('openDataViewDialog', config)
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
      const _chart = !chart.code ? customDeserialize(chart) : chart
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
      config.key = isComponent ? randomString(8) : config.code
      // isComponent = false 从左侧新增时需要初始化theme的内容
      // isComponent = true从组件库添加自定义组件时不用初始化
      if (!isComponent) {
        config.theme = settingToTheme(config, 'dark')
        config.theme = settingToTheme(config, 'light')
      }
      console.log('1', config)
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
    },
    /**
     * 获取图片访问地址,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture (url) {
      return getFileUrl(url)
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
  border: 1px solid #fff !important;
}
//调整拖拽插件的句柄样式
//句柄公共样式
::v-deep .bs-handle-class{
  width: 16px!important;
  height: 16px!important;
  position: absolute;
  box-sizing: border-box;
  //background: #fff;
  border: 3px solid #c8ff00;
}
// 每个句柄不同样式
::v-deep .bs-handle-class-tl{
  top: -2px!important;
  left: -2px!important;
  display: block;
  cursor: nw-resize;
  border-right: none;
  border-bottom: none;
}
::v-deep .bs-handle-class-tm{
  top: -2px!important;
  left: calc(50% - 8px)!important;
  display: block;
  cursor: n-resize;
  border-left: none;
  border-right: none;
  border-bottom: none;
}
::v-deep .bs-handle-class-tr{
  top: -2px!important;
  right: -2px!important;
  display: block;
  cursor: ne-resize;
  border-left: none;
  border-bottom: none;
}
::v-deep .bs-handle-class-mr{
  top: calc(50% - 8px)!important;
  right: -2px!important;
  display: block;
  cursor: e-resize;
  border-left: none;
  border-top: none;
  border-bottom: none;
}
::v-deep .bs-handle-class-br{
  right: -2px!important;
  bottom: -2px!important;
  display: block;
  cursor: se-resize;
  border-left: none;
  border-top: none;
}
::v-deep .bs-handle-class-bm{
  right: calc(50% - 8px)!important;
  bottom: -2px!important;
  display: block;
  cursor: s-resize;
  border-left: none;
  border-right: none;
  border-top: none;
}
::v-deep .bs-handle-class-bl{
  left: -2px!important;
  bottom: -2px!important;
  display: block;
  cursor: sw-resize;
  border-right: none;
  border-top: none;
}
::v-deep .bs-handle-class-ml{
  top: calc(50% - 8px)!important;
  left: -2px!important;
  display: block;
  cursor: w-resize;
  border-top: none;
  border-right: none;
  border-bottom: none;
}
</style>
