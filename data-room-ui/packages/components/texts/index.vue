<template>
  <div
    class="dataroom-chart-texts-wrapper"
  >
    <div
      ref="contentBox"
      class="content-box"
      :style="contentStyle"
      @click="goLink"
    >
      <p
        class="text"
        :style="textStyle"
      >
        {{ content }}
      </p>
    </div>
  </div>
</template>
<script>
import baseChartMixins from '@gcpaas/data-room-ui/packages/js/mixins/baseChartMixins'
import mockData from './data.json'
export default {
  name: 'Texts',
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
      mockData
    }
  },

  computed: {
    content () {
      if (this.config.dataSource && this.config.dataSource.businessKey && this.temporaryData && this.temporaryData.length) {
        return this.temporaryData[0][this.config.dataSource.dimensionField]
      }
      return this.config.props.content
    },
    url () {
      if (this.config.dataSource && this.config.dataSource.businessKey && this.temporaryData && this.temporaryData.length) {
        return this.temporaryData[0][this.config.dataSource.metricField]
      }
      return this.config.props.urlConfig.url
    },
    textShadow () {
      if (this.config.props.textShadow && this.config.props.textShadow.length) {
        const textShadowList = this.config.props.textShadow.map(item => {
          const offsetX = item.offset.offsetX + 'px'
          const offsetY = item.offset.offsetY + 'px'
          const blur = item.blur + 'px'
          const color = item.color
          return `${offsetX} ${offsetY} ${blur} ${color}`
        })

        // 将多个 text-shadow 字符串用逗号连接起来
        return textShadowList.join(', ')
      } else {
        return ''
      }
    },
    contentStyle () {
      return {
        alignItems: this.config.props.textAlign.vertiAlign,
        justifyContent: this.config.props.textAlign.horiAlign,
        backgroundColor: this.config.props.backgroundStyle.bgColor,
        borderRadius: this.config.props.backgroundStyle.borderRadius + 'px',
        borderWidth: this.config.props.backgroundStyle.bgBorder.width + 'px',
        borderStyle: this.config.props.backgroundStyle.bgBorder.style,
        borderColor: this.config.props.backgroundStyle.bgBorder.color,
        cursor: this.config.props.cursor ? 'pointer' : 'default'
      }
    },
    textStyle () {
      return {
        color: this.config.props.textStyle.color,
        fontSize: this.config.props.textStyle.fontSize + 'px',
        fontWeight: this.config.props.textStyle.fontWeight,
        fontFamily: this.config.props.textStyle.fontFamily,
        writingMode: this.config.props.writingMode,
        letterSpacing: this.config.props.letterSpacing + 'px',
        whiteSpace: this.config.props.ellipsis ? 'nowrap' : 'normal',
        textOverflow: this.config.props.ellipsis ? 'ellipsis' : 'clip',
        textShadow: this.textShadow
      }
    }
  },
  mounted () {
  },
  methods: {
    // 获取图表数据后的处理
    updateChartDataWithData (data) {
      this.temporaryData = data || []
    },
    // 跳转链接
    goLink () {
      if (this.url) {
        window.open(this.url, this.config.props.urlConfig.ifBlank ? '_blank' : '_self')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-chart-texts-wrapper{
  width: 100%;
  height: 100%;
  .content-box {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 超出部分隐藏 */
  }

  .text {
    overflow: hidden;
    max-width: 100%; /* 限制文本的最大宽度 */
  }
}
</style>
