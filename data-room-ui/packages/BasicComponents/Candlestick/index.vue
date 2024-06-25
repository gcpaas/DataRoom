<template>
  <div
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
    Data () {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    Data: {
      handler (newVal, oldVal) {
        if (newVal.w !== oldVal.w || newVal.h !== oldVal.h) {
          this.$nextTick(() => {
            this.charts.resize()
          })
        }
      },
      deep: true
    }
  },
  mounted () {
    this.chartInit()
  },
  beforeDestroy () {
    this.charts?.clear()
  },
  methods: {
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
      console.log('dataFormatting', _data)
      const data = _data?.data
      if (data && data.length) {
        this.xData = data.map(item => item[config.dataSource.x])
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
        xAxis: {
          data: this.xData
        },
        yAxis: {},
        series: [
          {
            type: 'candlestick',
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
