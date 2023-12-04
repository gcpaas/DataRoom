<template>
  <div
    class="bs-design-wrap bs-bar"
    style="width: 100%; height: 100%"
  >
    <el-button v-if="currentDeep > 0" class="button" type='text' @click="backToPreviousLevel(config)"> 返回上一级</el-button>
    <div
      :id="`chart${config.code}`"
      style="width: 100%; height: 100%"
    />
  </div>
</template>
<script>
import 'insert-css'
import * as echarts from 'echarts'
import {nameMap} from './json/mapData.js'
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
  data() {
    return {
      charts: null,
      hasData: false,
      level: '',
      option: {},
      mapList: [],
      currentDeep: 0,
    }
  },
  computed: {
    Data() {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    Data: {
      handler(newVal, oldVal) {
        if (newVal.w !== oldVal.w || newVal.h !== oldVal.h) {
          this.$nextTick(() => {
            this.charts.resize()
          })
        }
      },
      deep: true
    }
  },
  mounted() {
    this.chartInit()
  },
  beforeDestroy() {
    this.charts?.clear()
  },
  methods: {
    chartInit() {
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
    dataFormatting(config, data) {
      let coordinates = {}
      if (data.data) {
        coordinates = this.formatMapData(data.data)
      }
      config.option = {
        ...config.option,
        data: data?.data,
        ...coordinates
      }
      return config
    },
    /**
     * 格式化地图飞线数据
     * @param {Array} data
     */
    formatMapData(data) {
      const lines_coord = []
      let from_coord = []
      let to_coord = []
      if (data) {
        // 起点名称
        const fromName = this.config.customize.dataField?.fromName || 'from'
        // 起点经度
        const fromLng = this.config.customize.dataField?.fromLng || 'lng1'
        // 起点纬度
        const fromLat = this.config.customize.dataField?.fromLat || 'lat1'
        // 终点名称
        const toName = this.config.customize.dataField?.toName || 'to'
        // 终点经度
        const toLng = this.config.customize.dataField?.toLng || 'lng2'
        // 终点纬度
        const toLat = this.config.customize.dataField?.toLat || 'lat2'
        // 值
        const value = this.config.customize.dataField?.value || 'value'
        data.forEach(val => {
          // 飞线
          lines_coord.push({value: val[value], msg: {...val}, coords: [[val[fromLng], val[fromLat]], [val[toLng], val[toLat]]]})
          // 起点散点
          from_coord.push({name: val[fromName], value: [val[fromLng], val[fromLat], val[value]], msg: {...val}})
          // 终点散点
          to_coord.push({name: val[toName], value: [val[toLng], val[toLat], val[value]], msg: {...val}})
        })
      }
      return {
        lines_coord,
        from_coord,
        to_coord
      }
    },

    /**
     * 返回上一级
     * @param {*} config
     */
    async backToPreviousLevel(config) {
      this.currentDeep--
      let map = this.mapList[this.currentDeep]
      // 移除mapList中的最后一个元素
      this.mapList.pop()
      let mapData = JSON.parse(map.geoJson)
      this.option.geo.map = map.name;
      // this.changeData({...config, customize: {...config.customize, level: map.level, scope: map.name}})
      echarts.registerMap(map.name, mapData);
      this.charts.setOption(this.option, true);
    },
    /**
     * 修改地图数据
     * @param {Array} data
     */
    changeMapData(data) {
      let coordinates = this.formatMapData(data)
      this.option.series[0].data = coordinates.to_coord
      this.option.series[1].data = coordinates.from_coord
      this.option.series[2].data = coordinates.lines_coord
      this.charts.setOption(this.option)
    },
    /**
     * 初始化地图
     * 该方法继承自commonMixins
     * @param {*} config
     */
    async newChart(config) {
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )
      // 处理option，将配置项转换为echarts的option
      this.handleOption(config)
      this.level = config.customize.level
      let hasMapId = !!config.customize.mapId
      // 根据mapId获取地图数据
      let mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/info/${config.customize.mapId}`
      // 如果设置了地图id，就用地图id获取地图数据，否则用默认的世界地图
      if (!hasMapId) {
        mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/default/worldMap/world`
      }
      const mapResp = await this.$dataRoomAxios.get(decodeURI(mapInfoUrl), {}, true)
      let mapData = hasMapId ? JSON.parse(mapResp.data.geoJson) : mapResp
      if (hasMapId && mapResp.data.uploadedGeoJson !== 1) {
        // 没有上传过geoJson
        this.$message({
          message: '请先上传地图数据',
          type: 'warning'
        })
        return
      }
      this.mapList.push(mapResp.data)
      echarts.registerMap(config.customize.scope, mapData)
      this.charts.setOption(this.option)
      // 注册点击事件
      this.registerClickEvent(config)
    },
    /**
     * 处理配置项option
     * @param {*} config
     */
    handleOption(config) {
      this.option = {
        nameMap: config.customize.level == '0' ? nameMap : '',
        // graphic: [
        // ],
        geo: {
          map: config.customize.scope,
          zlevel: 10,
          show: true,
          layoutCenter: ['50%', '50%'],
          roam: true,
          layoutSize: "100%",
          zoom: 1,
          label: {
            // 通常状态下的样式
            normal: {
              show: config.customize.mapName,
              textStyle: {
                color: config.customize.mapNameColor || '#fff',
                fontSize: config.customize.mapNameSize || 12,
                fontWeight: config.customize.mapNameWeight || 500
              }
            },
            // 鼠标放上去的样式
            emphasis: {
              textStyle: {
                color: config.customize.mapNameColor || '#fff',
                fontSize: config.customize.mapNameSize || 12,
                fontWeight: config.customize.mapNameWeight || 500
              }
            }
          },
          // 地图区域的样式设置
          itemStyle: {
            normal: {
              borderColor: config.customize.mapLineColor,
              borderWidth: 1,
              areaColor: config.customize.areaColor,
              shadowColor: 'fffff',
              shadowOffsetX: -2,
              shadowOffsetY: 2,
              shadowBlur: 10
            },
            // 鼠标放上去高亮的样式
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          }
        },
        tooltip: {
          backgroundColor: config.customize.tooltipBackgroundColor,
          borderColor: config.customize.borderColor,
          show: true,
          textStyle: {
            color: config.customize.fontColor,
          },
        },
        series: [
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 15,
            symbolSize: 8,
            rippleEffect: {
              period: 4, brushType: 'stroke', scale: 4
            },
            tooltip: {
              trigger: 'item',
              formatter(params) {
                const a = eval(config.customize.scatterFormatter)
                return a
              },
            },
            itemStyle: {
              color: config.customize.scatterColor,
              opacity: 1
            },
            data: config.option.to_coord
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 15,
            symbolSize: 12,
            tooltip: {
              trigger: 'item',
              formatter(params) {
                const a = eval(config.customize.scatterFormatter)
                return a
              },
            },
            rippleEffect: {
              period: 6, brushType: 'stroke', scale: 8
            },

            itemStyle: {
              color: config.customize.scatterCenterColor,
              opacity: 1
            },
            data: config.option.from_coord
          },
          {
            type: 'lines',
            coordinateSystem: 'geo',
            zlevel: 15,
            tooltip: {
              trigger: 'item',
              formatter(params) {
                const a = eval(config.customize.lineFormatter)
                return a
              },
            },
            effect: {
              show: true,
              period: 5,
              trailLength: 0,
              symbol: config.customize.symbol,
              color: config.customize.symbolColor,
              symbolSize: config.customize.symbolSize,
            },
            lineStyle: {
              normal: {
                color: function (value) {
                  return '#ffffff'
                }, width: 2, opacity: 0.6, curveness: 0.2
              }
            },
            data: config.option.lines_coord
          }

        ]
      }
      if (config.customize.visual) {
        this.option.visualMap = {
          show: false,
          min: config.customize.range[0],
          max: config.customize.range[1],
          seriesIndex: [0, 2],
          inRange: {
            color: config.customize.rangeColor
          }
        }
      }
    },
    /**
     * 注册点击事件
     * @param config 地图组件配置项
     */
    registerClickEvent(config) {
      this.charts.on('click', async (params) => {
        let data = params?.data?.msg
        if (data) {
          this.linkage({...data, clickAreaName: params.name})
        } else {
          this.linkage({clickAreaName: params.name})
        }
        if (params.name == '') return
        if (!config.customize.down) {
          return
        }
        // 到达允许下钻的层数，则不再下钻
        if (this.currentDeep >= config.customize.downLevel) return
        const mapUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/data/${this.mapList[this.currentDeep].id}/${params.name}`
        const map = await this.$dataRoomAxios.get(decodeURI(mapUrl), {}, false)
        // 地图不可用
        if (map.available !== 1) {
          this.$message({
            message: '未找到该地图配置',
            type: 'warning'
          })
          return
        }
        this.currentDeep++
        this.mapList.push(map)
        // this.changeData({...config, customize: {...config.customize, scope: params.name}})
        this.option.geo.map = params.name
        echarts.registerMap(params.name, JSON.parse(map.geoJson));
        this.charts.setOption(this.option, true);
      });
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
