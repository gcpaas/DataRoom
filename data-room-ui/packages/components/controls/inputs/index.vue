<template>
  <div
    class="dataroom-chart-inputs-wrapper"
    @click="clickHandler"
    @mouseenter="hoverHandler"
    @mouseleave="leaveHandler"
  >
    <el-input
      :id="`el-input-${config.code}`"
      ref="contentBox"
      v-model="inputValue"
      class="content-box inputs-box"
      :style="inputsStyle"
      :placeholder="config.props.placeholder"
      :clearable="config.props.clearable"
      @change="changeHandler"
    />
  </div>
</template>
<script>
import baseChartMixins from '@gcpaas/data-room-ui/packages/js/mixins/baseChartMixins'
import mockData from './data.json'
export default {
  name: 'Inputs',
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
      isHover: false,
      mockData,
      inputValue: ''
    }
  },

  computed: {
    inputInnerStyle () {
      return {
        color: this.config.props.textStyle.color,
        fontSize: this.config.props.textStyle.fontSize + 'px',
        fontWeight: this.config.props.textStyle.fontWeight,
        fontStyle: this.config.props.textStyle.fontStyle,
        fontFamily: this.config.props.textStyle.fontFamily,
        backgroundColor: this.config.props.background,
        paddingLeft: this.config.props.indent + 'px',
        border: this.isHover ? `${this.config.props.hover.border.borderWidth}px ${this.config.props.hover.border.borderStyle} ${this.config.props.hover.border.borderColor}`
          : `${this.config.props.normal.border.borderWidth}px ${this.config.props.normal.border.borderStyle} ${this.config.props.normal.border.borderColor}`,
        borderRadius: this.isHover ? this.config.props.hover.border.borderRadius + 'px'
          : this.config.props.normal.border.borderRadius + 'px'
      }
    },
    inputsStyle () {
      return {
        '--input-placeholder-color': this.config.props.placeholderStyle.color,
        '--input-placeholder-font-size': this.config.props.placeholderStyle.fontStyle + 'px',
        '--input-placeholder-font-weight': this.config.props.placeholderStyle.fontWeight,
        '--input-placeholder-font-style': this.config.props.placeholderStyle.fontStyle,
        '--input-placeholder-font-family': this.config.props.placeholderStyle.fontFamily
      }
    }
  },
  mounted () {
  },
  methods: {
    // 更新组件样式
    updateChartStyle () {
      this.$nextTick(() => {
        const inputEl = document.querySelector(`#el-input-${this.config.code}`)
        // if (!inputEl) {
        Object.keys(this.inputInnerStyle).forEach(key => {
          inputEl.style[key] = this.inputInnerStyle[key]
        })
        // }
      })
    },
    hoverHandler () {
      this.isHover = true
      this.updateChartStyle()
    },
    leaveHandler () {
      this.isHover = false
      this.updateChartStyle()
    },
    // 获取图表数据后的处理
    updateChartDataWithData (data) {
      this.temporaryData = data || []
    },
    // 事件注册
    triggerClickEvent () {
    },
    // 输入框内容改变
    changeHandler () {
    },
    clickHandler () {
      this.$refs.contentBox.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-chart-inputs-wrapper{
  width: 100%;
  height: 100%;
  .content-box {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 超出部分隐藏 */
  }
  .inputs-box{
    ::v-deep .el-input__inner{
      height: 100%;

    }
    ::v-deep .el-input__inner::placeholder {
      color: var(--input-placeholder-color);
      font-size: var(--input-placeholder-font-size);
      font-weight: var(--input-placeholder-font-weight);
      font-family: var(--input-placeholder-font-family);
      font-style: var(--input-placeholder-font-style);
    }
  }

}
</style>
