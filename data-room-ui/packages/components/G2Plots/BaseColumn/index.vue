<template>
  <div
    v-show="initRequestData"
    style="width: 100%;height: 100%"
    class="dataroom-chart-baseBar-wrapper"
  >
    <div
      :id="'chart' + config.code"
      style="width: 100%;height: 100%"
    />
  </div>
</template>

<script>
// 引入g2plot图表的公共方法
import g2plotMixins from '@gcpaas/data-room-ui/packages/components/G2Plots/js/mixins/g2plotMixins.js'
import mockData from './data.json'
export default {
  name: 'BaseBar',
  components: {},
  mixins: [g2plotMixins],
  props: {
  },
  data () {
    return {
      mockData,
      show: true
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    // 更新图表配置
    updateChartStyle () {
      this.config.option.seriesField = this.config.option.xField
      if (this.chart) {
        this.$nextTick(() => {
          const option = {
            ...this.config.option,
            data: this.temporaryData
          }
          this.chart.update(option)
          this.$forceUpdate()
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
