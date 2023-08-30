<template>
  <div class="marquee-box">
    <div class="scroll-area">
      <!-- 设置margin，使内容 有从无到有的出现效果 -->
      <div class="marquee-container">
        <div class="icon">
          <i
            v-if="config.customize.icon.position === 'left'"
            :class="config.customize.icon.name"
            :style="{ color: config.customize.icon.color, fontSize: config.customize.fontSize + 'px' }"
          />
        </div>

        <svg class="svg-container">
          <defs>
            <linearGradient
              :id="'backgroundGradient-'+config.code"
              :x1="0"
              :y1="['to top right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
              :x2="['to right','to bottom right','to top right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
              :y2="['to bottom','to bottom right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
            >
              <stop
                offset="0%"
                :stop-color="config.customize.backgroundColorType === 'pure' ? config.customize.backgroundColor : config.customize.bgGradientColor0"
              />
              <stop
                offset="100%"
                :stop-color="config.customize.backgroundColorType === 'pure' ? config.customize.backgroundColor : config.customize.bgGradientColor1"
              />
            </linearGradient>
            <linearGradient
              :id="'textGradient-'+config.code"
              :x1="0"
              :y1="['to top right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
              :x2="['to right','to bottom right','to top right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
              :y2="['to bottom','to bottom right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
            >
              <stop
                offset="0%"
                :stop-color="config.customize.textColorType === 'pure' ? config.customize.textColor : config.customize.textGradientColor0"
              />
              <stop
                offset="100%"
                :stop-color="config.customize.textColorType === 'pure' ? config.customize.textColor : config.customize.textGradientColor1"
              />
            </linearGradient>
          </defs>
          <rect
            v-if="config.customize.backgroundColorType !== 'transparent'"
            width="100%"
            height="100%"
            :fill="`url(#backgroundGradient-${config.code})`"
          />
          <text
            :x="10"
            :y="config.customize.fontSize"
            :style="{ fontSize: config.customize.fontSize + 'px', fontWeight: config.customize.fontWeight }"
            :fill="`url(#textGradient-${config.code})`"
          >
            <animate
              v-if="isAnimate"
              :attributeName="attributeName[config.customize.direction]"
              :from="from[config.customize.direction]"
              :to="to[config.customize.direction]"
              :dur="config.customize.dur + 's'"
              repeatCount="indefinite"
            />

            {{ config.customize.title }}
          </text>
        </svg>
        <div class="icon">
          <i
            v-if="config.customize.icon.position === 'right'"
            :class="config.customize.icon.name"
            :style="{ color: config.customize.icon.color, fontSize: config.customize.fontSize + 'px' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Speech from 'speak-tts'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
export default {
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      customClass: {},
      attributeName: {
        right: 'x',
        left: 'x',
        top: 'y',
        bottom: 'y'
      },
      // 动画开始
      from: {
        left: '-100%',
        right: '100%',
        top: '-100%',
        bottom: '100%'
      },
      // 动画结束
      to: {
        left: '100%',
        right: '-100%',
        top: '100%',
        bottom: '-100%'
      },
      isAnimate: true,
      // 组件内部数据
      innerData: null,
      // 音频播放
      aduio: null,
      // 语音播报
      speech: null,
      // 语音播报定时器
      speechTimer: null
    }
  },
  computed: {

  },
  mixins: [paramsMixins, commonMixins],
  mounted () {
    this.chartInit()
    // 如果点击了生成图片，则先关闭动画
    EventBus.$on('stopMarquee', () => {
      this.isAnimate = false
    })
    // 图片生成完成后，再开启动画
    EventBus.$on('startMarquee', () => {
      this.isAnimate = true
    })
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  beforeDestroy () {
    EventBus.$off('stopMarquee')
    EventBus.$off('startMarquee')
    // 销毁语音播报定时器
    if (this.speechTimer) {
      clearInterval(this.speechTimer)
    }
  },
  methods: {
    dataFormatting (config, data) {
      // 数据返回成功则赋值
      if (data.success) {
        data = data.data
        // 获取到后端返回的数据，有则赋值
        if (config.dataHandler) {
          try {
            // 此处函数处理data
            eval(config.dataHandler)
          } catch (e) {
            console.error(e)
          }
        }
        config.option.data = data
        config.customize.title = config.option.data[config.dataSource.dimensionField] || config.customize.title
        this.innerData = config
        // 语音播报
      } else {
        // 数据返回失败则赋前端的模拟数据
        config.option.data = []
      }
      return config
    },
    // 语音播报
    voiceBroadcast (config) {
      if (this.innerData) {
        if (config.customize.voiceBroadcast) {
          if (this.innerData.dataSource.businessKey && this.innerData.option.data[this.innerData.dataSource.metricField]) {
            // 如果aduio存在，先销毁这个实例，或者替换它的URL
            if (this.aduio) {
              this.aduio.pause()
              this.aduio = null
            }
            this.aduio = new Audio()
            this.aduio.src = this.innerData.option.data[this.innerData.dataSource.metricField]
            this.aduio.play()
          } else if (config.customize.title) {
            this.speechBroadcast(config.customize.title)
            // 根据配置的时间，定时播报，第一次播报后，再定时播报
            this.speechBroadcast(config.customize.title)
            if (config.customize.dur) {
              this.speechTimer = setInterval(() => {
                this.speechBroadcast(config.customize.title)
              }, config.customize.dur * 1000)
            }
          }
        } else {
          if (this.aduio) {
            this.aduio.pause()
            this.aduio = null
          }
        }
      } else {
        if (config.customize.voiceBroadcast) {
          this.speech = new Speech()
          if (config.customize.dur) {
            this.speechBroadcast(config.customize.title)
            this.speechTimer = setInterval(() => {
              this.speechBroadcast(config.customize.title)
            }, config.customize.dur * 1000)
          }
        }
      }
    },
    // 语音播报
    speechBroadcast (text) {
      if (this.speech.hasBrowserSupport()) {
        this.speech.setLanguage('zh-CN')
        this.speech.init()
        this.speech.speak({ text: text })
      } else {
        this.$message({
          message: '您的浏览器不支持语音播报',
          type: 'warning'
        })
      }
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      this.voiceBroadcast(config)
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
    },
    // 监听页面是否可见
    handleVisibilityChange () {
      if (document.visibilityState === 'hidden') {
        if (this.aduio) {
          this.aduio.pause()
        }
        if (this.speech) {
          this.speech.pause()
        }
      } else {
        if (this.aduio) {
          this.aduio.play()
        }
        if (this.speech) {
          this.speech.resume()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.marquee-box {
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;

  .scroll-area {
    width: 100%;
    height: 100%;

    .marquee-container {
      width: 100%;
      height: 100%;
      display: flex;

      .svg-container {
        width: 100%;
        height: 100%;
      }
    }
  }
  .icon {
    position: relative;
    top: 0;
    // 清除浮动
  }
}
</style>
