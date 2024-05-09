<template>
  <div
    class="bs-design-wrap"
  >
    <div
      class="content-box"
      :style="imgStyle"
      @click="goLink"
    />
  </div>
</template>
<script>

import baseChartMixins from '@gcpaas/data-room-ui/packages/js/mixins/baseChartMixins'
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'

export default {
  name: 'Picture',
  components: {},
  mixins: [baseChartMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      size: {
        repeat: 'auto auto',
        'repeat-x': 'auto 100%',
        'repeat-y': '100% auto',
        'no-repeat': '100% 100%'

      },
      customClass: {}
    }
  },

  computed: {
    url () {
      if (this.config.dataSource && this.config.dataSource.businessKey && this.temporaryData && this.temporaryData.length) {
        return this.getCoverPicture(this.temporaryData[0][this.config.dataSource.dimensionField])
      }
      return this.config.props.imageType === 'bitmap' ? this.getCoverPicture(this.config.props.backgroundImage) : this.getCoverPicture(this.config.props.vectorImage)
    },
    linkUrl () {
      if (this.config.dataSource && this.config.dataSource.businessKey && this.temporaryData && this.temporaryData.length) {
        return this.temporaryData[0][this.config.dataSource.metricField]
      }
      return this.config.props.urlConfig.url
    },
    imgStyle () {
      return {
        backgroundImage: `url(${this.url})`,
        backgroundRepeat: this.config.props.repeat,
        backgroundSize: this.size[this.config.props.repeat],
        borderRadius: this.config.props.radius + 'px',
        cursor: this.config.props.cursor ? 'pointer' : 'default',
        filter: `hue-rotate(${this.config.props.filter.hue.show ? this.config.props.filter.hue.hue : 0}deg) saturate(${this.config.props.filter.saturate.show ? this.config.props.filter.saturate.saturate : 100}%) brightness(${this.config.props.filter.brightness.show ? this.config.props.filter.brightness.brightness : 100}%) contrast(${this.config.props.filter.contrast.show ? this.config.props.filter.contrast.contrast : 100}%) opacity(${this.config.props.filter.opacity.show ? this.config.props.filter.opacity.opacity : 1})`
      }
    }
  },
  mounted () {
  },
  methods: {
    // 图片地址处理
    getCoverPicture (url) {
      if (url) {
        if (url.startsWith('data:image/')) {
          // 如果是Base64格式，则直接返回URL
          return url
        } else {
          // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
          return getFileUrl(url)
        }
      } else { return '' }
    },
    // 获取图表数据后的处理
    updateChartDataWithData (data) {
      this.$nextTick(() => {
        this.temporaryData = data || []
      })
    },
    // 跳转链接
    goLink () {
      if (this.linkUrl) {
        window.open(this.linkUrl, this.config.props.urlConfig.ifBlank ? '_blank' : '_self')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .content-box{
    width: 100%;
    height: 100%;
    text-align: center;
    background-size: auto auto;
  }
}

</style>
