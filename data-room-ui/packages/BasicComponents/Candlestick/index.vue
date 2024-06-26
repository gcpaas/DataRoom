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
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'Candlestick',
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
      xData: [],
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
        this.xData = data.map(item => item[config.dataSource.xfield])
        this.yData = data.map(item => [item[config.dataSource.openField], item[config.dataSource.closeField], item[config.dataSource.lowField], item[config.dataSource.highField]])
      } else {
        this.xData = ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
        this.yData = [
          [20, 34, 10, 38],
          [40, 35, 30, 50],
          [31, 38, 33, 44],
          [38, 15, 5, 42]
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
        xAxis:
          {
            show: true,
            name: config.customize.xAxis.name,
            nameGap: config.customize.xAxis.nameGap,
            data: this.xData,
            nameTextStyle: {
              color: config.customize.xAxis.nameColor,
              fontSize: config.customize.xAxis.nameSize
            },
            nameLocation: config.customize.xAxis.position,
            // 坐标轴刻度设置
            axisTick: {
              show: true,
              alignWithLabel: true,
              lineStyle: {
                width: config.customize.xAxis.tickWidth,
                color: config.customize.xAxis.tickColor
              }
            },
            // 是否显示坐标轴的轴线
            axisLine: {
              show: true,
              lineStyle: {
                color: config.customize.xAxis.lineColor,
                width: config.customize.xAxis.lineWidth
              }
            },
            // 坐标轴刻度标签
            axisLabel: {
              show: true,
              textStyle: {
                fontSize: config.customize.xAxis.labelSize,
                color: config.customize.xAxis.labelColor
              },
              margin: 30
            }
          },
        yAxis: {
          name: config.customize.yAxis.name,
          nameGap: config.customize.yAxis.nameGap,
          nameTextStyle: {
            color: config.customize.yAxis.nameColor,
            fontSize: config.customize.yAxis.nameSize
          },
          nameLocation: config.customize.yAxis.position,
          show: true,
          axisLabel: {
            show: true,
            textStyle: {
              fontSize: config.customize.yAxis.labelSize,
              color: config.customize.yAxis.labelColor
            },
            margin: 10
          },
          axisTick: {
            show: true,
            length: 1,
            lineStyle: {
              width: config.customize.yAxis.tickWidth,
              color: config.customize.yAxis.tickColor
            }
          },
          // 分隔线
          splitLine: {
            show: config.customize.gridShow, // yAxis.show配置为true时，该配置才有效
            lineStyle: {
              color: config.customize.gridColor,
              width: config.customize.gridWidth
            }
          },
          // y轴轴线是否显示
          axisLine: {
            show: true,
            lineStyle: {
              color: config.customize.yAxis.lineColor,
              width: config.customize.yAxis.lineWidth
            }

          }
        },
        tooltip: {
          // 显示提示框
          show: true,
          trigger: 'item',
          backgroundColor: 'rgba(50,50,50,0.7)',
          borderColor: '#333',
          borderWidth: 1,
          textStyle: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 'normal'
          },

          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: config.customize.left || 50,
          right: config.customize.right || 20,
          bottom: config.customize.bottom || 60,
          top: config.customize.top || 20
        },
        series: [
          {
            type: 'candlestick',
            label: {
              show: true,
              position: 'inside',
              color: '#fff',
              fontSize: 12
            },
            itemStyle: {
              color: config.customize.highColor,
              color0: config.customize.lowColor
            },
            data: this.yData
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
