<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap bs-bar"
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
import commonMixins from 'packages/js/mixins/commonMixins.js'
import paramsMixins from 'packages/js/mixins/paramsMixins'
import linkageMixins from 'packages/js/mixins/linkageMixins'
import { get } from 'packages/js/utils/http'
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
      charts: null,
      hasData: false
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
    buildOption (config, data) {
      const dataList = []
      data?.data?.forEach(item => {
        dataList.push({ name: item[config.customize.name], value: [item[config.customize.xaxis], item[config.customize.yaxis], item[config.customize.value]] })
      })
      config.option = {
        ...config.option,
        data: dataList
      }
      return config
    },
    async newChart (options) {
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )
      const option = {
        // 背景颜色
        backgroundColor: this.config.customize.backgroundColor,
        geo: {
          map: this.config.customize.scope,
          label: {
            // 通常状态下的样式
            normal: {
              show: this.config.customize.mapName,
              textStyle: {
                color: '#fff'
              }
            },
            // 鼠标放上去的样式
            emphasis: {
              textStyle: {
                color: '#fff'
              }
            }
          },
          // 地图区域的样式设置
          itemStyle: {
            normal: {
              borderColor: this.config.customize.mapLineColor,
              borderWidth: 1,
              areaColor: this.config.customize.areaColor,
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
        // 提示浮窗样式
        tooltip: {
          show: false,
          trigger: 'item',
          alwaysShowContent: false,
          backgroundColor: this.config.customize.tooltipBackgroundColor,
          borderColor: this.config.customize.borderColor,
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
        series: this.config.customize.scatter
          ? [
              // {
              //   type: 'effectScatter',
              //   coordinateSystem: 'geo',
              //   effectType: 'ripple',
              //   showEffectOn: 'render',
              //   rippleEffect: {
              //     period: 10,
              //     scale: 10,
              //     brushType: 'fill'
              //   },

              //   hoverAnimation: true,
              //   itemStyle: {
              //     normal: {
              //       color: 'rgba(255, 235, 59, .7)',
              //       shadowBlur: 10,
              //       shadowColor: '#333'
              //     }
              //   },
              //   tooltip: {
              //     formatter(params) {
              //       return `<p style="text-align:center;line-height: 30px;height:30px;font-size: 14px;border-bottom: 1px solid #7A8698;">${
              //         params.name
              //       }</p>
              //   <div style="line-height:22px;margin-top:5px">GDP<span style="margin-left:12px;color:#fff;float:right">${
              //     params.data?.value[2] || '--'
              //   }</span></div>`
              //     },
              //     show: true
              //   },
              //   zlevel: 1,
              //   data: [
              //     { name: '西藏自治区', value: [91.23, 29.5, 1] },
              //     { name: '黑龙江省', value: [128.03, 47.01, 1007] },
              //     { name: '北京市', value: [116.4551, 40.2539, 5007] }
              //   ]
              // }
              {
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: 'pin',
                legendHoverLink: true,
                symbolSize: [60, 60],
                showEffectOn: 'render',
                rippleEffect: {
                  brushType: 'stroke'
                },
                hoverAnimation: true,
                zlevel: 1,
                // 这里渲染标志里的内容以及样式
                label: {
                  show: true,
                  formatter (value) {
                    return value.data.value[2]
                  },
                  color: this.config.customize.scatterColor
                },
                // 标志的样式
                itemStyle: {
                  normal: {
                    color: this.config.customize.scatterBackgroundColor,
                    shadowBlur: 2,
                    shadowColor: 'D8BC37'
                  }
                },
                data: options.data
              }
            ]
          : [
              {
                type: 'map',
                map: this.config.customize.scope,
                geoIndex: 0,
                roam: false,
                zoom: 1.5,
                center: [105, 36],
                showLegendSymbol: false, // 存在legend时显示
                data: options.data,
                tooltip: {
                  formatter (params) {
                    return `<p style="text-align:center;line-height: 30px;height:30px;font-size: 14px;border-bottom: 1px solid #7A8698;">${
                      params.name
                    }</p>
                <div style="line-height:22px;margin-top:5px">GDP<span style="margin-left:12px;color:#fff;float:right">${
                  params.data?.value[2] || '--'
                }</span></div>`
                  },
                  show: true
                }
              }
            ]
      }
      if (this.config.customize.visual) {
        option.visualMap = {
          show: true,
          min: this.config.customize.range[0],
          max: this.config.customize.range[1],
          seriesIndex: [0],
          inRange: {
            color: this.config.customize.rangeColor
          }
        }
      }
      const mapUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/${this.config.customize.level}/${this.config.customize.dataMap}`
      const map = await get(decodeURI(mapUrl), {}, true)
      echarts.registerMap(this.config.customize.scope, map)
      this.charts.setOption(option)
      // this.charts.on('click', (params) => {
      //   get(
      //     `${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/province/${params.name}.json`,
      //     {},
      //     true
      //   ).then((res) => {
      //     option.geo.map = params.name
      //     echarts.registerMap(params.name, res)
      //     this.charts.setOption(option, true)
      //   })
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/assets/style/echartStyle';
.light-theme {
  background-color: #ffffff;
  color: #000000;
}
.auto-theme {
  background-color: rgba(0, 0, 0, 0);
}
</style>
