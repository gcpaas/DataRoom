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
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'BaseBar',
  components: {},
  mixins: [g2plotMixins],
  props: {
  },
  data () {
    return {
      previousLayout: 'horizontal', // 保存上一次的 layout 属性值
      mockData,
      show: true,
      respData: null, // 指的是后端返回的整个数据
      temporaryData: null// 指的是处理后的适用于当前图表的数据格式的数据
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    updateChartStyle () {
      if (this.chart) {
        this.$nextTick(() => {
          const config = cloneDeep(this.config)
          this.temporaryData = this.handleData(this.respData)
          // console.log('temporaryData', this.temporaryData)
          const option = {
            ...config.option,
            data: this.temporaryData
          }
          console.log('option', option)
          // 获取当前 layout 属性
          const currentLayout = this.config.option.layout
          if (this.previousLayout !== currentLayout) {
            // 如果 layout 属性发生变化，销毁现有图表实例并重新创建
            this.previousLayout = currentLayout // 更新 previousLayout 为当前 layout 属性
            this.initChart() // 重新创建图表实例
          } else {
            // 如果 layout 属性未发生变化，则更新图表
            if (!config.option.showLegend) {
              this.chart.update({ ...option, legend: false })
            } else {
              this.chart.update(option)
            }
          }

          this.$forceUpdate()
        })
      }
    },
    handleData (data) {
      this.respData = cloneDeep(data)
      if (this.config.dataSource.businessKey !== '') {
        return this.config.prop.data.map((item, index) => ({
          ...item,
          title: data[index][this.config.dataSource.classifiedField],
          measures: [data[index][this.config.dataSource.metricField]],
          target: data[index][this.config.dataSource.dimensionField]
        }))
      } else {
        return this.config.prop.data
      }
    }
  }

}
</script>

<style scoped lang="scss">
</style>
