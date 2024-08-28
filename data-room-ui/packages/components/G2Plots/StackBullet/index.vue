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

          // 处理子弹图的数据，将字段值包裹在数组中
          this.temporaryData = this.wrapFieldsInArray(
            this.temporaryData,
            config.dataSource.dimensionField,
            config.dataSource.seriesField
          )

          const option = {
            ...config.option,
            data: this.temporaryData
          }

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
