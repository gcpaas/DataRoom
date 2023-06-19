<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap"
  >
    <video-player
      ref="videoPlayer1"
      :options="videoOptions"
      class="vjs-custom-skin videoPlayer"
      :playsinline="true"
    />
  </div>
</template>
<script>
import { videoPlayer } from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-hls'
import { refreshComponentMixin } from 'packages/js/mixins/refreshComponent'
export default {
  name: 'Video',
  components: { videoPlayer },
  mixins: [refreshComponentMixin],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {},
  beforeDestroy () {
    this.$refs.videoPlayer1.dispose()
  },
  data () {
    return {
      // TODO 这里介绍各个参数的意义
      videoOptions: {
        live: true,
        // 浏览器准备好时开始回放
        autoplay: false,
        // true：默认视频播放无声音，需要手动开启声音
        muted: false,
        // 播放速度
        playbackRates: [0.5, 1.0, 1.5, 2.0],
        // 语言
        language: 'zh-CN',
        // 当true时，播放器将按比例缩放以适应其容器
        fluid: true,
        // 无法播放时提示信息
        notSupportedMessage: '该视频无法正常播放',
        // 纵横比或屏幕高宽比
        aspectRatio: '16:9',
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: true,
          // 全屏按钮
          fullscreenToggle: true
        },
        // 播放器宽度，测试无效
        // width: 100,
        // 视频封面图
        poster: this.config.customize.posterUrl,
        sources: [
          {
            // 流配置，数组形式，会根据兼容顺序自动切换
            type: this.config.customize.videoType,
            src: this.config.customize.videoUrl
          }
        ]
      },
      dataForm: {
        script: ''
      }
    }
  },

  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .videoPlayer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }
}

/*滚动条样式*/
/deep/::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}

/deep/::-webkit-scrollbar-thumb {
  background: #dddddd !important;
  border-radius: 10px;
}
/deep/ .video-js .vjs-big-play-button {
  z-index: 100;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 4em;
}
</style>
