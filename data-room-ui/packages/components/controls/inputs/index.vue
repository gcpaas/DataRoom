<template>
  <div
    class="dataroom-chart-inputs-wrapper"
    @click="clickHandler"
  >
    <el-input
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
      mockData,
      inputValue: '12345678899'
    }
  },

  computed: {
    inputInnerStyle () {
      return {
        color: this.config.props.textStyle.color,
        fontSize: this.config.props.textStyle.fontSize,
        fontWeight: this.config.props.textStyle.fontWeight,
        fontStyle: this.config.props.textStyle.fontStyle,
        fontFamily: this.config.props.textStyle.fontFamily,
        backgroundColor: this.config.props.background
      }
    },
    inputsStyle () {
      return {
        color: 'red'
      }
    }
  },
  mounted () {
  },
  methods: {
    // 更新组件样式
    updateChartStyle () {
      const inputEl = this.$refs.contentBox.$refs.$el.querySelector('.el-input__inner')
      Object.keys(this.inputInnerStyle).forEach(key => {
        inputEl.style[key] = this.inputInnerStyle[key]
      })
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
      console.log('changeHandler', this.inputValue)
    },
    clickHandler () {
      console.log(this.$refs.contentBox)
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
  }

}
</style>
