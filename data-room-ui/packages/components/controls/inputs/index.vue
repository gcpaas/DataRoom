<template>
  <div
    class="dataroom-chart-texts-wrapper"
  >
    <el-input
      ref="contentBox"
      class="content-box"
      :style="contentStyle"
      @change="changeHandler"
    >
      <p
        class="text"
        :style="textStyle"
      >
        {{ content }}
      </p>
    </el-input>
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
      mockData
    }
  },

  computed: {
    contentStyle () {
      return {
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
