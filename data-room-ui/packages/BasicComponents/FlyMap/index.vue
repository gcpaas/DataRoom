<template>
  <div
    class="bs-design-wrap bs-bar"
    style="width: 100%; height: 100%"
  >
    <el-button v-if="currentDeep > 0" class="button" type='text' @click="jumpTo(config)"> 返回上一级</el-button>
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
    dataFormatting(config, data) {
      config.option = {
        ...config.option,
        data: data?.data
      }
      return config
    },
    async jumpTo(config) {
      this.currentDeep--
      let map = this.mapList[this.currentDeep]
      // 移除mapList中的最后一个元素
      this.mapList.pop()
      let mapData = JSON.parse(map.geoJson)
      this.option.geo.map = map.name;
      this.changeData({...config, customize: {...config.customize, level: map.level, scope: map.name}})
      echarts.registerMap(map.name, mapData);
      this.charts.setOption(this.option, true);
    },
    async newChart(config) {
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )
      this.level = config.customize.level
      const lines_coord = []
      let fromCoord = []
      let coord = []

      let hasMapId = !!config.customize.mapId

      // 根据mapId获取地图数据
      let mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/info/${config.customize.mapId}`
      // 如果设置了地图id，就用地图id获取地图数据，否则用默认的世界地图
      if (!hasMapId) {
        mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/default/worldMap/world`
      }
      this.$dataRoomAxios.get(mapInfoUrl, {}, true).then(res => {
        if (this.config.option.data) {
          // 起点名称
          const fromName = config.customize.dataField?.fromName || 'from'
          // 起点经度
          const fromLng = config.customize.dataField?.fromLng || 'lng1'
          // 起点纬度
          const fromLat = config.customize.dataField?.fromLat || 'lat1'
          // 终点名称
          const toName = config.customize.dataField?.toName || 'to'
          // 终点经度
          const toLng = config.customize.dataField?.toLng || 'lng2'
          // 终点纬度
          const toLat = config.customize.dataField?.toLat || 'lat2'
          // 值
          const value = config.customize.dataField?.value || 'value'

          this.config.option.data.forEach(val => {
            // 飞线
            lines_coord.push({value: val[value], msg: {...val}, coords: [[val[fromLat], val[fromLng]], [val[toLat], val[toLng]]]})
            // 起点散点
            fromCoord.push({name: val[fromName], value: [val[fromLat], val[fromLng], val[value]], msg: {...val}})
            // 终点散点
            coord.push({name: val[toName], value: [val[toLat], val[toLng], val[value]], msg: {...val}})
          })
        }
        let mapData = hasMapId ? JSON.parse(res.data.geoJson) : res
        if (hasMapId && res.data.uploadedGeoJson !== 1) {
          // 没有上传过geoJson
          this.$message({
            message: '请先上传地图数据',
            type: 'warning'
          })
          return
        }

        this.mapList.push(res.data)
        echarts.registerMap(config.customize.scope, mapData)
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
              data: coord
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
              data: fromCoord
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
              data: lines_coord
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
        this.charts.setOption(this.option)
        // 点击下钻
        this.charts.on('click', async (params) => {
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
          this.changeData({...config, customize: {...config.customize, scope: params.name}})
          this.option.geo.map = params.name
          echarts.registerMap(params.name, JSON.parse(map.geoJson));
          this.charts.setOption(this.option, true);
        });
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
