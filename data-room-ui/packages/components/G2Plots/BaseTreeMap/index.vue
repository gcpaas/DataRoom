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
import cloneDeep from 'lodash/cloneDeep'
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
    updateChartStyle () {
      if (this.chart) {
        this.$nextTick(() => {
          const config = cloneDeep(this.config)
          // 矩形树图的数据格式是固定的，需要将数据处理成矩形树图的数据格式
          console.log('temporaryData', this.temporaryData)
          this.temporaryData = this.replaceNameByTree(this.temporaryData, config.dataSource.dimensionField, config.dataSource.metricField)
          const option = {
            ...config.option,
            data: this.temporaryData
          }

          // 如果不显示图例
          if (!this.config.option.showLegend) {
            this.chart.update({ ...option, legend: false })
          } else {
            this.chart.update(option)
          }
          this.$forceUpdate()
        })
      }
    },
    // 处理数据
    handleData (data) {
      return this.replaceNameByTree(data, this.config.dataSource.dimensionField, this.config.dataSource.metricField)
    },
    // 根据指定的字段名称来替换list里面的名称
    replaceNameByTree (list = [], dimensionField = 'name', metricField = 'value') {
      // 由于矩形树图需要的是一个对象，但是请求回来的数据是数组，所以需要进行判断：
      // 判断list是否为对象，如果是对象的话默认取children
      if (typeof list === 'object' && list.children) {
        list = list.children
      }
      function transformNode (node) {
        const newNode = {}

        for (const key in node) {
          if (key === dimensionField) {
            newNode.name = node[key]
          } else if (key === metricField) {
            newNode.value = node[key]
          } else if (key === 'children') {
            newNode.children = node[key].map(transformNode)
          } else {
            newNode[key] = node[key]
          }
        }

        return newNode
      }
      // 返回组件所需要的格式是一个对象并且 name: 'root'是固定结构
      return {
        name: 'root',
        children: list.map(transformNode)
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
