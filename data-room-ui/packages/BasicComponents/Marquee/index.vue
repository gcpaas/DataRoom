<template>
  <div class="marquee-box">
    <div class="scroll-area">
      <!-- 设置margin，使内容 有从无到有的出现效果 -->
      <div class="marquee-container">
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
            <i
              v-if="config.customize.icon.position === 'left'"
              :class="config.customize.icon.name"
              :style="{ color: config.customize.icon.color, fontSize: config.customize.fontSize + 'px' }"
            />
            {{ config.customize.title }}
            <i
              v-if="config.customize.icon.position === 'right'"
              :class="config.customize.icon.name"
              :style="{ color: config.customize.icon.color, fontSize: config.customize.fontSize + 'px' }"
            />
          </text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
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
      isAnimate: true
    }
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
  },
  beforeDestroy () {
    EventBus.$off('stopMarquee')
    EventBus.$off('startMarquee')
  },
  methods: {
    changeStyle () {
    },
    dataFormatting (config, data) {
      // 文本数据配置原则：选择数据集则以后端返回的数据为主，否则以设置面板中标题设置为准
      if (config.dataSource.businessKey) {
        config.customize.title = data && data.data && data.data.length ? data.data[0][config.dataSource.metricField] : '暂无数据'
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
.marquee-box {
  width: 100%;
  height: 100%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;

  .scroll-area {
    width: 100%;
    height: 100%;
    display: inline-block;

    .marquee-container {
      width: 100%;
      height: 100%;
      display: inline-block;

      .svg-container {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
    }
  }
}
.el-icon-edit{
  &:before{
    content: '11111';
    font-size: 20px;
  }
}
</style>
