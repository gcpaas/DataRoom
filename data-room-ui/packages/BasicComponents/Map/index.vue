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
      currentDeep: 0,
      mapList: [],
      charts: null,
      hasData: false,
      level: '',
      option: {}
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
      this.option.series[0].data = data
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
      let hasMapId = !!config.customize.mapId
      // 根据mapId获取地图数据
      let mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/info/${config.customize.mapId}`
      // 如果设置了地图id，就用地图id获取地图数据，否则用默认的世界地图
      if (!hasMapId) {
        mapInfoUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/map/default/chinaMap.country/中华人民共和国`
      }
      const mapResp = await this.$dataRoomAxios.get(decodeURI(mapInfoUrl), {}, true)
      const map = hasMapId ? JSON.parse(mapResp.data.geoJson) : mapResp
      if (hasMapId && mapResp.data.uploadedGeoJson !== 1) {
        // 没有上传过geoJson
        this.$message({
          message: '请先上传地图数据',
          type: 'warning'
        })
        return
      }
      this.mapList.push(mapResp.data)
      echarts.registerMap(config.customize.scope, map)
      this.charts.setOption(this.option)
      // 注册点击事件
      this.registerClickEvent(config)
    },
    /**
     * 处理配置项option
     * @param {*} config
     */
    handleOption(config) {
      let center1 = config.customize.center1 ? config.customize.center1 + '%' : '50%'
      let center2 = config.customize.center2 ? config.customize.center2 + '%' : '50%'
      let scatterSeries = {
        type: 'scatter',
        // 坐标系类型
        coordinateSystem: 'geo',
        // 标记符号形状 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        symbol: config.customize.scatterSymbol ? config.customize.scatterSymbol : 'pin',
        // 是否允许图例和散点图之间的联动效果
        legendHoverLink: true,
        // 散点图标记符号的大小，[宽度,高度]
        symbolSize: config.customize.scatterSize ? [config.customize.scatterSize, config.customize.scatterSize] : [40, 40],
        // 触发特效的方式
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        zlevel: 11,
        // 这里渲染标志里的内容以及样式
        label: {
          show: config.customize.hasOwnProperty('showScatterValue') ? config.customize.showScatterValue : true,
          formatter(value) {
            return value.data.value[2]
          },
          color: config.customize.scatterColor
        },
        // 标志的样式
        itemStyle: {
          normal: {
            color: config.customize.scatterBackgroundColor,
            shadowBlur: 2,
            shadowColor: 'D8BC37'
          }
        },
        data: config.option?.data
      }
      let mapSeries = {
        type: 'map',
        map: config.customize.scope,
        geoIndex: 0,
        roam: false,
        zoom: 1.5,
        center: [105, 36],
        showLegendSymbol: false, // 存在legend时显示
        data: config.option?.data,
        tooltip: {
          formatter(params) {
            return `<p style="text-align:center;line-height: 30px;height:30px;font-size: 14px;border-bottom: 1px solid #7A8698;">${
              params.name
            }</p>
                <div style="line-height:22px;margin-top:5px">${config.customize.tooltipTitle ? config.customize.tooltipTitle : 'GDP'}<span style="margin-left:12px;color:#fff;float:right">${
              params.data?.value[2] || '--'
            }</span></div>`
          },
          show: true
        }
      }
      let series = config.customize.scatter ? [ scatterSeries ] : [ mapSeries ]
      this.option = {
        // 背景颜色
        backgroundColor: config.customize.backgroundColor,
        graphic: [],
        geo: {
          map: config.customize.scope,
          zlevel: 9,
          show: true,
          // 地图中心点位置
          layoutCenter: [center1, center2],
          roam: true,
          layoutSize: "100%",
          zoom: config.customize.zoom || 1,
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
              areaColor: config.customize.emphasisColor ? config.customize.emphasisColor :'#389BB7',
              borderWidth: 0
            }
          }
        },
        // 提示浮窗样式
        tooltip: {
          show: false,
          trigger: 'item',
          alwaysShowContent: false,
          backgroundColor: config.customize.tooltipBackgroundColor,
          borderColor: config.customize.borderColor,
          hideDelay: 100,
          triggerOn: 'mousemove',
          enterable: true,
          textStyle: {
            color: '#DADADA',
            fontSize: '12',
            width: 20,
            height: 30,
            overflow: 'break'
          },
          showDelay: 100
        },
        // 视觉映射
        visualMap: {
          show: !config.customize.scatter,
          calculable: config.customize.visual,
          min: config.customize.range[0],
          max: config.customize.range[1],
          seriesIndex: config.customize.scatter ? -1 : 0,
          inRange: {
            color: config.customize.rangeColor
          }
        },
        series: series
      }
    },

    /**
     * 注册点击事件
     * @param config 地图组件配置项
     */
    registerClickEvent(config) {
      this.charts.on('click', async (params) => {
        let data = params?.data?.originData
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
        echarts.registerMap(params.name, geoJsonObj);
        this.charts.setOption(this.option, true);
      });
    },


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
