<template>
  <div
    class="bs-design-wrap"
  >
    <div
      class="content-box"
      :style="{'color': config.color}"
    >
      {{ config.text }}
    </div>
  </div>
</template>
<script>
import baseChartMixins from '@gcpaas/data-room-ui/packages/js/mixins/baseChartMixins'
import cloneDeep from 'lodash/cloneDeep'
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
      customClass: {}
    }
  },

  computed: {
  },
  mounted () {
  },
  methods: {
    // 获取图表数据后的处理
    handleChartData (data) {
      const config = cloneDeep(this.config)
      config.data = data
      this.chartProvide.updateChartConfig(config)
      this.updateChartStyle(this.config)
    },
    // 更新配置
    updateChartStyle (config) {
      this.config.text = config.data && config.data.length ? config.data[0][config.dataSource.metricField] : '暂无数据'
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap{
  width: 100%;
  display: flex;
  align-items: center;
  //justify-content: center;
}
.content-box{
  width: 100%;
  text-align: center;
}
</style>
