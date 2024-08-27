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
    updateChartStyle () {
      if (this.chart) {
        this.$nextTick(() => {
          const config = cloneDeep(this.config)

          console.log('temporaryData', this.temporaryData)
          // 专门处理子弹图的数据，将字段值包裹在数组中
          this.temporaryData = this.wrapFieldsInArray(
            this.temporaryData,
            config.dataSource.dimensionField,
            config.dataSource.seriesField
          )

          const option = {
            ...config.option,
            data: this.temporaryData
          }

          if (!config.option.showLegend) {
            this.chart.update({ ...option, legend: false })
          } else {
            this.chart.update(option)
          }

          this.$forceUpdate()
        })
      }
    },
    handleData (data) {
      // 处理子弹图的数据
      return this.wrapFieldsInArray(
        data,
        this.config.dataSource.dimensionField,
        this.config.dataSource.seriesField
      )
    },
    wrapFieldsInArray (list, dimensionField, seriesField) {
      function transformNode (node) {
        const newNode = {}

        for (const key in node) {
          if (key === dimensionField || key === seriesField) {
            // 将 dimensionField 和 seriesField 的值包裹成数组
            newNode[key] = [node[key]]
          } else {
            newNode[key] = node[key]
          }
        }

        return newNode
      }

      // 直接返回转换后的节点列表
      return list.map(transformNode)
    }
  }

}
</script>

<style scoped lang="scss">
</style>
