<template>
  <div class="dataroom-chart-button-wrapper">
    <div
      ref="contentBox"
      class="content-box"
      :style="contentStyle"
      @mouseover="state = 'hover'"
      @mousedown="state = 'click'"
      @mouseup="state = 'normal'"
      @mouseleave="state = 'normal'"
      @click="goLink"
    >
      <button
        class="dataroom-chart-button"
        :style="buttonStyle"
      >
        {{ content }}
      </button>
    </div>
  </div>
</template>
<script>
import baseChartMixins from '@gcpaas/data-room-ui/packages/js/mixins/baseChartMixins'
import mockData from './data.json'

export default {
  name: 'Button',
  props: {
    chart: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [baseChartMixins],
  inject: ['canvasInst'],
  computed: {
    content () {
      if (this.config.dataSource && this.config.dataSource.businessKey && this.temporaryData && this.temporaryData.length) {
        return this.temporaryData[0][this.config.dataSource.dimensionField]
      }
      return this.config.props.global.buttonContent
    },
    contentStyle () {
      return {
        borderWidth: this.config.props[this.state].border.borderWidth + 'px',
        borderColor: this.config.props[this.state].border.borderColor,
        borderRadius: this.config.props[this.state].border.borderRadius + 'px',
        borderStyle: this.config.props[this.state].border.borderStyle
      }
    },
    buttonStyle () {
      return {
        backgroundColor: this.config.props[this.state].background.color,
        backgroundImage: `url(${this.config.props[this.state].background.img})`,
        backgroundRepeat: this.config.props[this.state].background.repeat,
        backgroundSize: this.config.props[this.state].background.size,
        color: this.config.props[this.state].textStyle.color,
        fontStyle: this.config.props[this.state].textStyle.fontStyle,
        fontWeight: this.config.props[this.state].textStyle.fontWeight,
        fontFamily: this.config.props[this.state].textStyle.fontFamily,
        fontSize: this.config.props[this.state].textStyle.fontSize + 'px',
        textAlign: this.config.props[this.state].textStyle.textAlign
      }
    }
  },
  data () {
    return {
      state: 'normal', // 按钮的状态：normal/click/hover
      mockData
    }
  },
  methods: {
    // 跳转链接
    goLink () {
      if (this.config.props.urlConfig.url) {
        window.open(this.config.props.urlConfig.url, this.config.props.urlConfig.ifBlank ? '_blank' : '_self')
      }
    },
    // 获取图表数据后的处理
    updateChartDataWithData (data) {
      this.temporaryData = data || []
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-chart-button-wrapper {
  width: 100%;
  height: 100%;

  .content-box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    .dataroom-chart-button {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }
  }
}
</style>
