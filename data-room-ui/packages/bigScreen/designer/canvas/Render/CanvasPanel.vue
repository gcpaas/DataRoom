<template>
  <div
    id="container"
    ref="rootContainer"
    class="dataroom-bigscreen-container-wrap"
  >
    <div
      class="selecto-area"
    >
      <div
        v-for="(chart,index) in chartList"
        :key="index"
        class="com-item"
      >
        <div
          :class="`cube targetItem`"
          :data-code="chart.code"
          :style="{
            width: chart.w + 'px',
            height: chart.h + 'px',
            transform: chart.transform,
          }"
        >
          <Configuration
            :config="chart"
          >
            <render-card
              :ref="'renderCard' + chart.code"
              :config="chart"
            />
          </Configuration>
        </div>
      </div>
    </div>
    <Moveable
      ref="moveableRef"
      :target="targets"
      :draggable="true"
      :rotatable="true"
      :resizable="true"
      :root-container="rootContainer"
      @click="onClick"
      @drag="onDrag"
      @resize="onResize"
      @rotate="onRotate"
      @dragGroup="onDragGroup"
      @onResizeGroup="onResizeGroup"
      @onRotateGroup="onRotateGroup"
    />
    <Selecto
      ref="selectoRef"
      :root-container="moveableRef"
      :selectable-targets="['.selecto-area .cube']"
      :hit-rate="0"
      :select-by-click="true"
      :select-from-inside="false"
      :toggle-continue-select="['shift']"
      :ratio="0"
      @dragStart="onDragStart"
      @selectEnd="onSelectEnd"
    />
  </div>
</template>
<script>
import Moveable from 'vue-moveable'
import Selecto from 'vue-selecto'
import { diff } from '@egjs/children-differ'
import { replaceElement } from '@gcpaas/data-room-ui/packages/js/utils'
const RenderCard = () => import(/* webpackChunkName: "RenderCard" */ './RenderCard.vue')
const Configuration = () => import(/* webpackChunkName: "Configuration" */ './Configuration.vue')
export default {
  name: 'CanvasPanel',
  components: {
    Configuration,
    RenderCard,
    Moveable,
    Selecto
  },
  props: {
    chartList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      startW: null,
      startH: null,
      clientX: null,
      clientY: null,
      startPosition: '',
      // chartList: [],
      targets: [],
      selectoRef: null,
      moveableRef: null,
      rawChart: [],
      rootContainer: null
    }
  },
  inject: ['canvasInst'],
  computed: {
    scale () {
      return this.canvasInst.zoom / 100
    }
  },
  watch: {
  },
  created () {},
  mounted () {
    this.moveableRef = this.$refs.moveableRef
    this.rootContainer = document.querySelector('.container')
  },
  methods: {
    onClick (e) {
      if (e.isDouble) {
        const inputTarget = e.inputTarget
        const selectableElements = this.$refs.selectoRef.getSelectableElements()
        if (selectableElements.includes(inputTarget)) {
          this.$refs.selectoRef.setSelectedTargets([inputTarget])
          this.targets = [inputTarget]
        }
      }
    },
    onDrag (e) {
      // 记录开始位置
      if (e.isFirstDrag) {
        this.startPosition = e.transform
      }
      //  记录结束位置
      const endPosition = e.transform
      // 提取偏移量的开始坐标值
      const regex = /translate\((-?\d*\.?\d+)(?:px)?,?\s*(-?\d*\.?\d+)(?:px)?\)/
      const match1 = regex.exec(this.startPosition)
      const startValues = match1 ? match1.slice(1).map(parseFloat) : null
      // 提取结束坐标值
      const match2 = regex.exec(endPosition)
      const endValues = match2 ? match2.slice(1).map(parseFloat) : null

      // 计算坐标差值并根据缩放比例调整
      const diffValues = endValues.map((end, index) => (end - startValues[index]) / this.scale)
      // 计算新的坐标值并构建新的字符串
      const newValues = startValues.map((start, index) => start + diffValues[index])
      // 构建新的字符串
      const newTranslate = `translate(${newValues[0]}px, ${newValues[1]}px)`
      const [x, y] = newTranslate.match(/[-+]?\d*\.?\d+/g).map(Number)// 提取当前的 x 和 y 值
      const newTransform = e.transform.replace(/translate\(-?\d*\.?\d+px, -?\d*\.?\d+px\)/, newTranslate)
      e.target.style.transform = newTransform
      // 需要将位移保存到组件的配置中
      const code = e.target.getAttribute('data-code')
      const config = {
        code,
        x,
        y,
        transform: newTransform
      }
      const chartList = replaceElement(this.chartList, config)
      this.canvasInst.updateChartList(chartList)
    },
    onResize (e) {
      // // 记录开始位置
      if (e.isFirstDrag) {
        this.startW = e.width
        this.startH = e.height
        this.clientX = e.clientX
        this.clientY = e.clientY
      }
      // 计算宽高差值
      // 注意：这里需要根据缩放比例来计算，因为拖拽过程中可能存在缩放操作,同时结合方位e.direction是一个数组[1,1]代表向右下方拖拽，【-1,-1】代表向左上方拖拽
      const diffW = ((e.clientX - this.clientX) / this.scale) * e.direction[0] + this.startW
      const diffH = ((e.clientY - this.clientY) / this.scale) * e.direction[1] + this.startH
      e.target.style.width = `${diffW}px`
      e.target.style.height = `${diffH}px`
      e.target.style.transform = e.transform
      const [x, y] = e.transform.match(/[-+]?\d*\.?\d+/g).map(Number) // 提取当前的 x 和 y 值
      // 需要将大小位移保存到组件的配置中
      const code = e.target.getAttribute('data-code')
      const config = {
        code,
        x,
        y,
        w: diffW,
        h: diffH,
        transform: e.transform
      }
      const chartList = replaceElement(this.chartList, config)
      this.canvasInst.updateChartList(chartList)
    },
    onRotate (e) {
      e.target.style.transform = e.drag.transform
      // 需要将位移保存到组件的配置中
      const code = e.target.getAttribute('data-code')
      const config = {
        code,
        transform: e.transform
      }
      const chartList = replaceElement(this.chartList, config)
      this.canvasInst.updateChartList(chartList)
    },
    onDragGroup (e) {
      e.events.forEach(ev => {
        ev.target.style.transform = ev.transform
      })
    },

    onResizeGroup (e) {
      e.events.forEach(ev => {
        ev.target.style.width = `${ev.width}px`
        ev.target.style.height = `${ev.height}px`
        ev.target.style.transform = ev.drag.transform
      })
    },
    onRotateGroup ({ events }) {
      events.forEach(ev => {
        ev.target.style.transform = ev.drag.transform
      })
    },
    onDragStart (e) {
      // TODO 判断是否可拖拽,部分逻辑有冲突，暂时注释
      const moveable = this.$refs.moveableRef
      const target = e.inputEvent.target
      if (moveable.isMoveableElement(target) ||
        this.targets.some(t => t === target || t.contains(target))
      ) {
        e.stop()
      }
    },
    onSelectEnd (e) {
      const moveable = this.$refs.moveableRef
      let selected = e.selected
      selected = selected.filter(target => {
        return selected.every(target2 => {
          return target === target2 || !target2.contains(target)
        })
      })
      const result = diff(e.startSelected, selected)
      e.currentTarget.setSelectedTargets(selected)
      if (!result.added.length && !result.removed.length) {
        return
      }
      if (e.isDragStartEnd) {
        e.inputEvent.preventDefault()
        moveable.waitToChangeTarget().then(() => {
          moveable.dragStart(e.inputEvent)
        })
      }
      this.targets = selected
    }
  }
}
</script>
<style lang="scss" scoped>
.dataroom-bigscreen-container-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  .cube{
    position: absolute;
  }
  .targetItem{
    &:hover{
      border: 1px dashed #007aff;
      cursor: move;
    }
  }

}
</style>
