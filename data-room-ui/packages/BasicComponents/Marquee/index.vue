<template>
  <!-- 添加一个类似鼠标hover事件 -->
  <div class="marquee-box">
    <div class="scroll-area">
      <audio
        :ref="`audioPlayer${config.code}`"
        muted
        autoplay
        crossorigin="anonymous"
      />
      <!-- 设置margin，使内容 有从无到有的出现效果 -->
      <div
        class="marquee-container"
        @mouseenter.stop="mouseenter"
        @mouseleave.stop="mouseleave"
      >
        <div class="icon">
          <icon-svg
            v-if="config.customize.icon.name && config.customize.icon.position === 'left'"
            :name="config.customize.icon.name"
            :style="{ color: config.customize.icon.color, width: config.customize.fontSize + 'px',height: config.customize.fontSize + 'px' }"
          />
        </div>
        <svg class="svg-container">
          <defs>
            <linearGradient
              :id="'backgroundGradient-' + config.code"
              :x1="0"
              :y1="['to top right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
              :x2="['to right', 'to bottom right', 'to top right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
              :y2="['to bottom', 'to bottom right'].includes(config.customize.bgGradientDirection) ? '100%' : '0'"
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
              :id="'textGradient-' + config.code"
              :x1="0"
              :y1="['to top right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
              :x2="['to right', 'to bottom right', 'to top right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
              :y2="['to bottom', 'to bottom right'].includes(config.customize.textGradientDirection) ? '100%' : '0'"
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
          <icon-svg
            v-if="config.customize.icon.name && config.customize.icon.position === 'right'"
            :name="config.customize.icon.name"
            :style="{ color: config.customize.icon.color, width: config.customize.fontSize + 'px',height: config.customize.fontSize + 'px' }"
          />
        </div>
      </div>
    </div>
    <div
      v-show="config.customize.voiceBroadcast && showVoiceSwitch"
      class="voice-switch"
      :style="{fontSize:config.customize.fontSize + 'px',right:config.customize.fontSize + 5 + 'px',}"
      @mouseenter.stop="mouseenter"
    >
      <i
        :class="voiceSwitchValue ? 'el-icon-microphone' : 'el-icon-turn-off-microphone'"
        @click="voiceSwitch"
      />
    </div>
  </div>
</template>

<script>
import Speech from 'speak-tts'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
import IconSvg from 'data-room-ui/SvgIcon'
import { get } from 'sortablejs'
export default {
  name: 'Marquee',
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    IconSvg
  },
  data () {
    return {
      showVoiceSwitch: false,
      visibilityState: false,
      voiceSwitchValue: true,
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
      audio: null,
      // 音频地址
      isPlayAudio: null,
      // 语音播报
      speech: null,
      isInit: false,
      firstSpeech: true,
      numberBroadcasts: 0
    }
  },
  computed: {
    // speechText
    speechText () {
      return this.config.customize.title || ''
    },
    audioSrc: {
      get () {
        return this.config?.option?.data?.[this.config?.dataSource?.metricField] || ''
      },
      set (val) {
        this.config.option.data[this.config.dataSource.metricField] = val
      }
    }
  },
  watch: {
    speechText (val) {
      if (!this.isPreview && this.config.customize.voiceBroadcast && !this.isInit && !this.firstSpeech) {
        this.speechBroadcast(val)
      } else {
        if (this.speech) {
          this.speech = null
        }
      }
    },
    deep: true,
    audioSrc (val) {
      if (this.config.customize.voiceBroadcast) {
        if (this.audio) {
          this.audio.src = val
          this.audio.play()
        }
      } else {
        if (this.aduio) {
          this.aduio.pause()
          this.aduio = null
        }
      }
    }
  },
  mixins: [paramsMixins, commonMixins, linkageMixins],
  mounted () {
    this.chartInit()
    EventBus.$on('stopMarquee', () => {
      this.isAnimate = false
    })
    // 图片生成完成后，再开启动画
    EventBus.$on('startMarquee', () => {
      this.isAnimate = true
    })
    //  如果删除了组件
    EventBus.$on('deleteComponent', (codes) => {
      if (codes.includes(this.config.code)) {
        if (this.audio) {
          this.audio.pause()
          this.audio = null
        }
        if (this.speech) {
          this.speech = null
        }
      }
    })
    this.speech = null
    this.isInit = true
    // 如果是预览模式的话，则弹出对话框，当前大屏存在语音播报，是否开启语音播报
    if (this.isPreview && this.config.customize.voiceBroadcast) {
      this.$confirm('当前大屏存在语音播报，是否开启语音播报？若开启请点击确认或者回车', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        if (this.audioSrc) {
          this.audio.play()
        } else {
          this.speech = null
          this.speechBroadcast(this.config.customize.title)
          this.isInit = false
        }
      }).catch(() => { })
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  beforeDestroy () {
    EventBus.$off('stopMarquee')
    EventBus.$off('startMarquee')
    EventBus.$off('deleteComponent')
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
            console.info(e)
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
      // 清除上一个visibilitychange监听，重新开始监听
      if (this.voiceSwitchValue && !this.visibilityState && this.isInit) {
        this.voiceBroadcast(config)
      }
      return config
    },
    // 语音播报
    voiceBroadcast (config) {
      const innerData = this.innerData || config
      if (innerData) {
        if (config.customize.voiceBroadcast) {
          if (innerData?.dataSource?.businessKey && innerData?.option?.data[this.innerData.dataSource.metricField]) {
            // 如果aduio存在，先销毁这个实例，或者替换它的URL
            if (this.aduio) {
              this.aduio.pause()
              this.aduio = null
            }
            // 获取音频元素
            this.audio = this.$refs[`audioPlayer${config.code}`]
            this.audio.src = innerData.option.data[this.innerData.dataSource.metricField]
            this.audio.play()
          } else if (config.customize.title) {
            //  页面初始化不执行
            if (!this.isInit) {
              this.speechBroadcast(config.customize.title)
            }
          }
        } else {
          if (this.aduio) {
            this.aduio.pause()
            this.aduio = null
          }
        }
      }
    },
    // 语音播报
    speechBroadcast (text) {
      this.numberBroadcasts = 0
      this.speech = new Speech()
      this.speech.setLanguage('zh-CN')
      this.speech.pitch = 1
      this.speech.init()
      if (this.speech.hasBrowserSupport()) {
        if (this.numberBroadcasts < 1) {
          this.speech.speak({ text: text })
          this.numberBroadcasts += 1
        }
      } else {
        this.$message({
          message: '您的浏览器不支持语音播报',
          type: 'warning'
        })
      }
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      if (config.customize.voiceBroadcast && this.isInit && !config?.option?.data?.[this.config?.dataSource?.metricField]) {
        this.isInit = false
        this.speechBroadcast(config.customize.title)
        this.$nextTick(() => {
          this.firstSpeech = false
        })
      }
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
        this.visibilityState = true
        if (this.audio) {
          this.audio.pause()
        }
        if (this.speech) {
          this.speech = null
        }
      } else {
        this.visibilityState = false
        if (this.audio) {
          this.audio.play()
        }
        if (this.speech) {
          this.speech.resume()
        }
      }
    },
    voiceSwitch () {
      this.voiceSwitchValue = !this.voiceSwitchValue
      if (this.voiceSwitchValue) {
        if (this.audio) {
          try {
            this.audio.play()
          } catch (e) {
            console.info(e)
          }
        }
        if (this.speech) {
          this.speech.resume()
        }
      } else {
        if (this.audio) {
          try {
            this.audio.pause()
          } catch (e) {
            console.info(e)
          }
        }
        if (this.speech) {
          this.speech.pause()
        }
      }
    },
    mouseenter () {
      this.showVoiceSwitch = true
    },
    mouseleave () {
      this.showVoiceSwitch = false
    }
  }
}
</script>

<style lang="scss" scoped>
.marquee-box {
  width: 100%;
  height: 100%;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  position: relative;

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
.voice-switch{
  position: absolute;
  cursor: pointer;
  bottom: 5px;
  color: #fff;
}

</style>
