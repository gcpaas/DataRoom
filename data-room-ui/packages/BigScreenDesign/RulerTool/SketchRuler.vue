<template>
  <div
    id="wrapper"
    class="wrapper vue-ruler-wrapper"
    :style="{
      width: width + thick + 'px',
      height: height + thick + 'px'
    }"
  >
    <i
      :class="{
        'iconfont-bigscreen': true,
        'icon-eye': isShowReferLine,
        'icon-eye-close': !isShowReferLine
      }"
      @click="handleCornerClick"
    />
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
      :style="{
        width: innerWidth + 'px',
        height: innerHeight + 'px'
      }"
      @scroll="throttleScroll"
    >
      <div
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
import SketchRule from 'vue-sketch-ruler'
import { mapState, mapMutations } from 'vuex'
import { throttle } from 'lodash'
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
    ...mapState('bigScreen', {
      scale: state => state.zoom / 100,
      fitZoom: state => state.fitZoom,
      zoom: state => state.zoom
    }),
    presetLines () {
      const presetLine = this.$store.state.bigScreen.presetLine
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
    // 监听屏幕改变
    this.listenSize()
    this.initRuleHeight()
    this.throttleScroll()
  },
  methods: {
    ...mapMutations('bigScreen', [
      'changeZoom',
      'changeFitZoom'
    ]),
    listenSize () {
      window.onresize = throttle(() => {
        this.initRuleHeight()
      }, 100)
    },
    initRuleHeight () {
      setTimeout(() => {
        const screensRect = document
          .querySelector('.grid-wrap-box')
          ?.getBoundingClientRect()
        if (!screensRect) {
          return
        }

        // 30是grid-wrap-box的底部工具栏高度
        this.innerHeight = screensRect.height - 30
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

      // 标尺开始的刻度
      const startX = (screensRect.left + this.thick - canvasRect.left) / this.scale
      const startY = (screensRect.top + this.thick - canvasRect.top) / this.scale

      this.startX = startX >> 0
      this.startY = startY >> 0

      this.$emit('changeStart', {
        x: this.startX * this.scale + 50 - this.thick,
        y: this.startY * this.scale + 50 - this.thick
      })
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
        this.changeZoom(scale)
        this.changeFitZoom(scale)
      } else {
        this.changeZoom(100)
        this.changeFitZoom(100)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../BigScreenDesign/fonts/iconfont.css';
.wrapper {
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
}

#screens {
  position: absolute;
  overflow: scroll;

  // 滚动条美化，始终在最下方和最右方
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
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
/deep/ .line {
  border-left: 1px dashed #0089d0 !important;
  border-top: 1px dashed #0089d0 !important;
}
/deep/.action {
  .value {
    background: var(--bs-el-color-primary);
    padding: 4px;
    color: #fff;
  }

  .del {
    color: var(--bs-el-color-primary);
  }
}
/deep/ .ruler, /deep/ .corner {
  background: var(--bs-background-1);
}
/deep/ .corner {
  z-index: 999;
  background: var(--bs-background-1) !important;
}

/deep/ .mb-ruler {
  z-index: 998
}
.grid-bg {
  background-color: #2a2e33 !important;
  background-image: url(./images/canvas-bg.png);
    background-repeat: repeat;
    word-spacing: 10px;
}
</style>
