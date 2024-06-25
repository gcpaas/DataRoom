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
  name: 'MapCharts',
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
      option: {}
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
          this.newChart(res)
        })
      }
    },
    /**
     * 数据格式化
     * 该方法继承自commonMixins
     * @param {*} config
     * @param {Array} data
     */
    dataFormatting (config, data) {
      const dataList = []
      data?.data?.forEach(item => {
        dataList.push({
          name: item[config.customize.name],
          value: [item[config.customize.xaxis], item[config.customize.yaxis], item[config.customize.value]],
          // 原始数据
          originData: item
        })
      })
      config.option = {
        ...config.option,
        data: dataList
      }
      return config
    },
    /**
     * 返回上一级
     * @param {*} config
     */
    async backToPreviousLevel (config) {
      this.currentDeep--
      const map = this.mapList[this.currentDeep]
      // 移除mapList中的最后一个元素
      this.mapList.pop()
      const mapData = JSON.parse(map.geoJson)
      this.option.geo.map = map.name
      // this.changeData({...config, customize: {...config.customize, level: map.level, scope: map.name}})
      echarts.registerMap(map.name, mapData)
      this.charts.setOption(this.option, true)
    },
    /**
     * 修改地图数据
     * @param {Array} data
     */
    changeMapData (data) {
      this.option.series[0].data = data
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
      // 注册点击事件
      this.registerClickEvent(config)
    },
    /**
     * 处理配置项option
     * @param {*} config
     */
    handleOption (config) {
      this.option = {
        xAxis: {
          data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
        },
        yAxis: {},
        series: [
          {
            type: 'candlestick',
            data: [
              [20, 34, 10, 38],
              [40, 35, 30, 50],
              [31, 38, 33, 44],
              [38, 15, 5, 42]
            ]
          }
        ]
      }
    },

    /**
     * 注册点击事件
     * @param config 地图组件配置项
     */
    registerClickEvent (config) {
      this.charts.on('click', async (params) => {
        const data = params?.data?.originData
        if (data) {
          this.linkage({ ...data, clickAreaName: params.name })
        } else {
          this.linkage({ clickAreaName: params.name })
        }
        if (params.name == '') return
        if (!config.customize.down) {
          return
        }
        // 到达允许下钻的层数，则不再下钻
        if (this.currentDeep >= config.customize.downLevel) return
        const downMapUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/data/${this.mapList[this.currentDeep].id}/${params.name}`
        const downMap = await this.$dataRoomAxios.get(decodeURI(downMapUrl), {}, false)
        // 地图不可用
        if (downMap.available !== 1) {
          this.$message({
            message: '未找到该地图配置',
            type: 'warning'
          })
          return
        }
        let geoJsonObj
        try {
          geoJsonObj = JSON.parse(downMap.geoJson)
        } catch (error) {
          this.$message({
            message: params.name + '地图数据格式错误',
            type: 'warning'
          })
          return
        }
        this.currentDeep++
        this.mapList.push(downMap)
        // this.changeData({...config, customize: {...config.customize, scope: params.name}})
        this.option.geo.map = params.name
        echarts.registerMap(params.name, geoJsonObj)
        this.charts.setOption(this.option, true)
      })
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
