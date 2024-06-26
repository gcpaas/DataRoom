<!--
@name:
@description:
@author: byx
@time: 桑基图
-->
<template>
  <div
    :id="config.code + 'wrap'"
    class="bs-design-wrap bs-bar"
    style="width: 100%; height: 100%"
  >
    <div
      :id="`chart${config.code}`"
      style="width: 100%; height: 100%"
    />
  </div>
</template>
<script>
import 'insert-css'
import * as echarts from 'echarts'
import commonMixins from 'data-room-ui/js/mixins/commonMixins.js'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'

export default {
  name: 'Sankey',
  mixins: [paramsMixins, commonMixins, linkageMixins],
  props: {
    id: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      currentDeep: 0,
      mapList: [],
      charts: null,
      hasData: false,
      level: '',
      option: {},
      links: [],
      yData: []
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.chartInit()
    // 监听窗口或者父盒子大小变化
    this.chartResize()
  },
  beforeDestroy () {
    this.charts?.clear()
  },
  methods: {
    chartResize () {
      window.addEventListener('resize', () => {
        if (this.charts) {
          this.charts.resize()
        }
      })
      const dom = document.getElementById(`${this.config.code}wrap`)
      if (dom) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.charts) {
            this.charts.resize()
          }
        })
        this.resizeObserver.observe(dom)
      }
    },
    chartInit () {
      const config = this.config
      // key和code相等，说明是一进来刷新，调用list接口
      if (this.config.code === this.config.key || this.isPreview) {
        // 改变数据
        this.changeDataByCode(config).then((res) => {
          // 改变样式
          // config = this.changeStyle(res)
          this.newChart(config)
        }).catch(() => {
        })
      } else {
        // 否则说明是更新，这里的更新只指更新数据（改变样式时是直接调取changeStyle方法），因为更新数据会改变key,调用chart接口
        this.changeData(config).then((res) => {
          // 初始化图表
          this.newChart(config)
        })
      }
    },
    /**
     * 数据格式化
     * 该方法继承自commonMixins
     * @param {*} config
     * @param {Array} data
     */
    dataFormatting (config, _data) {
      const data = _data?.data
      if (data && data.length) {
        const list = data.map(item => [item[config.dataSource.dimensionField], item[config.dataSource.metricField]])?.flat() || []
        // 去重
        this.yData = [...new Set(list)]?.map(item => ({ name: item }))
        this.links = data.map(item => ({
          source: item[config.dataSource.dimensionField],
          target: item[config.dataSource.metricField],
          value: item[config.dataSource.seriesField]
        }))
      } else {
        this.links = [
          {
            source: 'a',
            target: 'a1',
            value: 5
          },
          {
            source: 'a',
            target: 'a2',
            value: 3
          },
          {
            source: 'b',
            target: 'b1',
            value: 8
          },
          {
            source: 'a',
            target: 'b1',
            value: 3
          },
          {
            source: 'b1',
            target: 'a1',
            value: 1
          },
          {
            source: 'b1',
            target: 'c',
            value: 2
          }
        ]
        this.yData = [
          { name: 'a' },
          { name: 'b' },
          { name: 'a1' },
          { name: 'a2' },
          { name: 'b1' },
          { name: 'c' }
        ]
      }
      return config
    },
    // 更新图表数据
    updateChartData (config) {
      this.handleOption(config)
      this.charts.setOption(this.option)
    },
    changeStyle (config) {
      this.handleOption(config)
      this.charts.setOption(this.option)
    },
    /**
     * 初始化地图
     * 该方法继承自commonMixins
     * @param {*} config
     */
    async newChart (config) {
      if (this.charts) {
        this.charts.dispose()
      }
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )
      // 处理option，将配置项转换为echarts的option
      this.handleOption(config)
      this.charts.setOption(this.option)
    },
    /**
     * 处理配置项option
     * @param {*} config
     */
    handleOption (config) {
      this.option = {
        tooltip: {
          // 显示提示框
          show: true,
          trigger: 'item',
          axisPointer: {
            type: 'line'
          }
        },
        series: [
          {
            type: 'sankey',
            top: config.customize.top || 20,
            bottom: config.customize.bottom || 20,
            left: config.customize.left || 20,
            right: config.customize.right || 50,
            label: {
              show: true,
              position: config.customize.normal.labelPosition || 'right',
              color: config.customize.normal.labelColor || '#fff',
              fontSize: config.customize.normal.labelSize || 12,
              fontWeight: config.customize.normal.labelFontWeight || 'bold'
            },
            itemStyle: {
              borderColor: config.customize.normal.itemBorderColor || '#aaa',
              borderWidth: config.customize.normal.itemBorderWidth || 1,
              borderType: config.customize.normal.itemBorderType || 'solid'
            },
            lineStyle: {
              color: config.customize.normal.lineColor || 'gradient',
              curveness: config.customize.normal.lineCurveness || 0.5// 图形的弯曲程度

            },
            emphasis: { // 聚焦文字时产生的高亮状态
              disabled: false,
              focus: 'trajectory',
              label: {
                color: config.customize.emphasis.labelColor || '#fff',
                fontSize: config.customize.emphasis.labelSize || 12,
                fontWeight: config.customize.normal.labelFontWeight || 'bold',
              },
              itemStyle: {
                borderColor: config.customize.emphasis.itemBorderColor || '#aaa',
                borderWidth: config.customize.emphasis.itemBorderWidth || 1,
                borderType: config.customize.emphasis.itemBorderType || 'solid'
              },
              lineStyle: {
                color: config.customize.emphasis.lineColor || 'gradient'
              }

            },
            data: this.yData,
            links: this.links
          }
        ]
      }
    }

  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/echartStyle';

.light-theme {
  background-color: #ffffff;
  color: #000000;
}

.auto-theme {
  background-color: rgba(0, 0, 0, 0);
}

.bs-design-wrap {
  position: relative;

  .button {
    position: absolute;
    z-index: 999;
  }
}
</style>
