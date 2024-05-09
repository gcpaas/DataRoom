<template>
  <div
    id="wrapper"
    class="dataroom-bigscreen-ruler-wrapper"
    :style="{
      width: width + thick + 'px',
      height: height + thick + 'px'
    }"
  >
    <div
      class="eye-box"
      @click="handleCornerClick"
    >
      <img
        v-if="isShowReferLine"
        src="./images/eye.png"
        alt=""
      >
      <img
        v-else
        src="./images/eye-close.png"
        alt=""
      >
    </div>

    <SketchRule
      :key="scale"
      :lang="lang"
      :thick="thick"
      :scale="scale"
      :width="width"
      :height="height"
      :start-x="startX"
      :start-y="startY"
      :shadow="shadow"
      :hor-line-arr="[...lines.h, ...presetLines.h]"
      :ver-line-arr="[...lines.v, ...presetLines.v]"
      :palette="Palette"
      :is-show-refer-line="isShowReferLine"
      :corner-active="cornerActive"
      @handleLine="handleLine"
      @onCornerClick="handleCornerClick"
    />
    <div
      id="screens"
      ref="screensRef"
      class="screens-box"
      :style="{
        width: width + 'px',
        height: innerHeight + 'px'
      }"
      @scroll="throttleScroll"
    >
      <div
        id="screen-container"
        ref="containerRef"
        class="screen-container grid-bg"
        :style="containerRefStyle"
      >
        <div
          id="canvas"
          :style="canvasStyle"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import throttle from 'lodash/throttle'
const SketchRule = () => import('vue-sketch-ruler')
export default {
  components: {
    SketchRule
  },
  props: {
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 400
    },
    pageWidth: {
      type: Number,
      default: 1920
    },
    pageHeight: {
      type: Number,
      default: 1080
    }
  },
  data () {
    return {
      canvasLeft: 0, // 存储画布到视口的left距离
      canvasTop: 0, // 存储画布到视口的top距离
      isDrag: false, // 小地图白块是否拖拽
      startX: 0,
      startY: 0,
      lines: {
        h: [],
        v: []
      },
      thick: 20,
      lang: 'zh-CN', // 中英文
      isShowRuler: true, // 显示标尺
      isShowReferLine: true, // 显示参考线
      cornerActive: true, // 左上角激活状态
      Palette: {
        bgColor: 'rgba(225,225,225, 0)',
        longfgColor: '#BABBBC',
        shortfgColor: '#C8CDD0',
        fontColor: '#7D8694',
        shadowColor: 'transparent',
        lineColor: '#0089d0',
        borderColor: '#transparent',
        cornerActiveColor: 'rgb(235, 86, 72, 0.6)'
      },

      containerRefStyle: {
        width: this.width + 'px',
        height: this.height + 'px'
      },
      innerHeight: 0,
      innerWidth: 0
    }
  },
  inject: ['canvasInst'],
  watch: {
    // 缩放改变的时候，改变startX，startY
    scale (scale) {
      // 防抖调用方法
      this.throttleScroll()
    },
    pageWidth (pageWidth) {
      if (this.fitZoom === this.zoom) {
        this.initZoom()
      }
    },
    pageHeight (pageHeight) {
      if (this.fitZoom === this.zoom) {
        this.initZoom()
      }
    }
  },
  computed: {
    scale () {
      return this.canvasInst.zoom / 100
    },
    fitZoom () {
      return this.canvasInst.fitZoom
    },
    zoom () {
      return this.canvasInst.zoom
    },
    presetLines () {
      // TODO:参考线的方法
      const presetLine = []
      // { type: 'h', site: y || 0 },
      const v = presetLine?.filter(p => p.type === 'h')?.map(p => p.site)
      const h = presetLine?.filter(p => p.type === 'v')?.map(p => p.site)
      return {
        h,
        v
      }
    },
    shadow () {
      return {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height
      }
    },
    canvasStyle () {
      return {
        width: this.width + 'px',
        height: this.height + 'px',
        transform: `scale(${this.scale})`,
        transformOrigin: '0 0 0'
      }
    }
  },
  mounted () {
    // 初始化canvasLeft canvasTop
    const canvasRect = document.querySelector('#canvas').getBoundingClientRect()
    this.canvasLeft = canvasRect.left
    this.canvasTop = canvasRect.top
    // 监听屏幕改变
    this.listenSize()
    this.initRuleHeight()
    this.throttleScroll()
    this.throttleDrag()
  },
  methods: {
    throttleDrag () {
      throttle(() => {
        this.dragSelection()
      }, 100)()
    },
    // 绑定滑块拖拽效果
    dragSelection () {
      const that = this
      const draggableElement = document.getElementById('selectionWin')
      const dragContainer = document.getElementById('selectWin')
      const screenElement = document.getElementById('screens')
      const screenContainer = document.getElementById('screen-container')
      const maxContainer = document.querySelector('.dataroom-bigscreen-design-wrap')
      // 鼠标按下的位置
      let posX, posY
      // 白色拖拽块相对于父盒子初始位置
      let initialX, initialY
      // 滚动条初始位置
      let scrollTop, scrollLeft
      draggableElement.addEventListener('mousedown', function (event) {
        that.isDrag = true
        posX = event.clientX
        posY = event.clientY
        initialX = draggableElement.getBoundingClientRect().left - dragContainer.getBoundingClientRect().left
        initialY = draggableElement.getBoundingClientRect().top - dragContainer.getBoundingClientRect().top
        scrollLeft = screenElement.scrollLeft
        scrollTop = screenElement.scrollTop
        maxContainer.addEventListener('mousemove', function (event) {
          // 在鼠标移动过程中判断出鼠标左键未点击，则停止拖拽
          if (event.buttons !== 1) {
            that.isDrag = false
          }
          if (that.isDrag) {
            event.preventDefault()
            // 鼠标移动距离
            let moveX = event.clientX - posX
            let moveY = event.clientY - posY
            // 避免白色拖拽移出边框
            if (moveX < -initialX) {
              moveX = -initialX
            } else if (moveX > dragContainer.getBoundingClientRect().width - draggableElement.getBoundingClientRect().width - initialX) {
              moveX = dragContainer.getBoundingClientRect().width - draggableElement.getBoundingClientRect().width - initialX
            }
            if (moveY < -initialY) {
              moveY = -initialY
            } else if (moveY > dragContainer.getBoundingClientRect().height - draggableElement.getBoundingClientRect().height - initialY) {
              moveY = dragContainer.getBoundingClientRect().height - draggableElement.getBoundingClientRect().height - initialY
            }
            const newX = moveX + initialX
            const newY = moveY + initialY
            // 移动拖拽白块
            draggableElement.style.left = newX + 'px'
            draggableElement.style.top = newY + 'px'
            // 移动比例
            const percentageX = moveX / (dragContainer.getBoundingClientRect().width - draggableElement.getBoundingClientRect().width)
            const percentageY = moveY / (dragContainer.getBoundingClientRect().height - draggableElement.getBoundingClientRect().height)
            // 进度条需要滚动的距离
            const scrollTopLength = percentageY * (screenContainer.getBoundingClientRect().height - screenElement.getBoundingClientRect().height)
            const scrollLeftLength = percentageX * (screenContainer.getBoundingClientRect().width - screenElement.getBoundingClientRect().width)
            screenElement.scrollLeft = scrollLeft + scrollLeftLength
            screenElement.scrollTop = scrollTop + scrollTopLength
          }
        })
      })
      maxContainer.addEventListener('mouseup', function (event) {
        that.isDrag = false
      })
      draggableElement.addEventListener('mouseup', function () {
        that.isDrag = false
      })
      // 禁止H5自带的拖拽事件
      draggableElement.ondragstart = function (ev) {
        ev.preventDefault()
      }
      draggableElement.ondragend = function (ev) {
        ev.preventDefault()
      }
      screenElement.ondragstart = function (ev) {
        ev.preventDefault()
      }
      screenElement.ondragend = function (ev) {
        ev.preventDefault()
      }
    },
    listenSize () {
      window.onresize = throttle(() => {
        this.initRuleHeight()
      }, 100)
    },
    initRuleHeight () {
      setTimeout(() => {
        const screensRect = document
          .querySelector('.dataroom-bigscreen-canvas-wrap')
          ?.getBoundingClientRect()
        if (!screensRect) {
          return
        }

        // 30是dataroom-bigscreen-canvas-wrap的底部工具栏高度
        this.innerHeight = screensRect.height
        this.innerWidth = screensRect.width
        this.diffX = this.width - screensRect.width
        this.diffY = this.height - screensRect.height

        this.containerRefStyle = {
          width: this.diffX > 0 ? ((this.width + this.diffX + this.thick + 30) + 'px') : (this.width + 'px'),
          height: this.diffY > 0 ? ((this.height + this.diffY + this.thick + 30) + 'px') : (this.height + 'px')
        }
        if (this.fitZoom === this.zoom) {
          this.initZoom()
        }
      })
    },
    handleLine (lines) {
      this.lines = lines
    },
    handleCornerClick () {
      this.isShowReferLine = !this.isShowReferLine
      this.cornerActive = !this.cornerActive
    },
    throttleScroll () {
      throttle(() => {
        this.handleScroll()
      }, 100)()
    },
    handleScroll () {
      const screensRect = document
        .querySelector('#screens')
        .getBoundingClientRect()
      const canvasRect = document
        .querySelector('#canvas')
        .getBoundingClientRect()
      // const container = document.querySelector('#selectWin').getBoundingClientRect()
      const screenContainer = document.querySelector('#screen-container').getBoundingClientRect()
      const draggableElement = document.getElementById('selectionWin')
      // 标尺开始的刻度
      const startX = (screensRect.left + this.thick - canvasRect.left) / this.scale
      const startY = (screensRect.top + this.thick - canvasRect.top) / this.scale

      this.startX = startX >> 0
      this.startY = startY >> 0

      this.$emit('changeStart', {
        x: this.startX * this.scale + 50 - this.thick,
        y: this.startY * this.scale + 50 - this.thick
      })
      // 拖动进度条移动小地图
      if (!this.isDrag) {
        const leftDrag = canvasRect.left - this.canvasLeft
        const topDrag = canvasRect.top - this.canvasTop
        // 小方块需要移动的距离
        const leftLength = leftDrag / (screenContainer.width - screensRect.width - 9) * (150 - 30)
        const topLength = topDrag / (screenContainer.height - screensRect.height - 9) * (150 - 30)
        draggableElement.style.left = -leftLength + 'px'
        draggableElement.style.top = -topLength + 'px'
      }
    },
    // 保证画布能完整展示大屏
    initZoom () {
      // 横向比例
      const xRadio = this.innerWidth / (this.pageWidth + 120)
      // 纵向比例
      const yRadio = this.innerHeight / (this.pageHeight + 120)
      // 取最小的适应比例
      const scale = Math.floor(Math.min(xRadio * 100, yRadio * 100))
      if (scale < 100) {
        this.canvasInst.changeZoom(scale)
        this.canvasInst.changeFitZoom(scale)
      } else {
        this.canvasInst.changeZoom(100)
        this.canvasInst.changeFitZoom(100)
      }
    }
  }
}
</script>
<style lang="scss" scoped>

.dataroom-bigscreen-ruler-wrapper {
  box-sizing: border-box;
  position: absolute;

  .iconfont-bigscreen {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 16px;
    color: #fff;
    z-index: 999;
    cursor: pointer;
  }
  #screens {
    position: absolute;
    overflow: scroll;

    // 滚动条美化，始终在最下方和最右方
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
      //display: none;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: var(--bs-el-background-2) !important;
    }

    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: transparent !important;
    }
  }

  .screen-container {
    position: absolute;
    width: 6000px;
    height: 6000px;
    overflow: hidden;
  }

  .scale-value {
    position: absolute;
    left: 0;
    bottom: 100%;
  }

  .button {
    position: absolute;
    left: 100px;
    bottom: 100%;
  }

  .button-ch {
    position: absolute;
    left: 200px;
    bottom: 100%;
  }

  .button-en {
    position: absolute;
    left: 230px;
    bottom: 100%;
  }

  #canvas {
    position: absolute;
    top: 50px;
    left: 50px;
  }

  ::v-deep .line {
    border-left: 1px dashed #0089d0 !important;
    border-top: 1px dashed #0089d0 !important;
  }

  ::v-deep .action {
    .value {
      background: var(--bs-el-color-primary);
      padding: 4px;
      color: #fff;
    }

    .del {
      color: var(--bs-el-color-primary);
    }
  }

  ::v-deep .ruler,
  ::v-deep .corner {
    background: #F5F5F5;
  }

  ::v-deep .corner {
    z-index: 999;
    background:#F5F5F5;
  }

  ::v-deep .mb-ruler {
    z-index: 998
  }

  .grid-bg {
    background-color: #E6E6E6 !important;
    background-image: url(./images/canvas-bg.png);
    background-repeat: repeat;
    word-spacing: 10px;
  }

  ::v-deep .lines {
    .line {
      .action {
        .del {
          color: var(--bs-el-text);
        }

        .value {
          color: var(--bs-el-text);
        }
      }
    }
  }
  .eye-box{
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background-color: #F5F5F5;
    z-index:2000;
    &:hover{
      cursor: pointer;
    }
    img{
      width: 100%;
      height: 100%;
    }
  }
}

</style>
