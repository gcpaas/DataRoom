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
      charts: null,
      hasData: false,
      level:''
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
        }).catch(() => {})
      } else {
        // 否则说明是更新，这里的更新只指更新数据（改变样式时是直接调取changeStyle方法），因为更新数据会改变key,调用chart接口
        this.changeData(config).then((res) => {
          // 初始化图表
          this.newChart(res)
        })
      }
    },
    dataFormatting (config, data) {
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
    async newChart (config) {
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )
      const option = {
        // 背景颜色
        backgroundColor: config.customize.backgroundColor,
        graphic: [
          ],
        geo: {
          map: config.customize.scope,
          zlevel: 10,
          show:true,
          layoutCenter: ['50%', '50%'],
          roam: true,
          layoutSize: "100%",
          zoom: 1,
          label: {
            // 通常状态下的样式
            normal: {
              show: config.customize.mapName,
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
        series: config.customize.scatter
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
            ]
          : [
              {
                type: 'map',
                map: config.customize.scope,
                geoIndex: 0,
                roam: false,
                zoom: 1.5,
                center: [105, 36],
                showLegendSymbol: false, // 存在legend时显示
                data: config.option?.data,
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
      if (config.customize.visual) {
        option.visualMap = {
          show: true,
          min: config.customize.range[0],
          max: config.customize.range[1],
          seriesIndex: [0],
          inRange: {
            color: config.customize.rangeColor
          }
        }
      }
      if(config.customize.down){
            // config?.customize?.graphic?.forEach((item,index)=>{
            option.graphic.push({
              type: "text",
              left: `220px`,
              top: "5%",
              style: {
                  text: '中国',
                  font: `bolder ${config.customize.fontSize}px "Microsoft YaHei", sans-serif`,
                  fill: config.customize.fontGraphicColor,
              },
              onclick:async()=>{
                this.level='country'
                const index = option.graphic.findIndex(i => i.style.text === '中国');
                // 点击元素之后的所有元素全部删除
                option.graphic.splice(index + 1);
                const mapUrl =`${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/country/中华人民共和国.json`
                const map = await this.$dataRoomAxios.get(decodeURI(mapUrl), {}, true)
                option.geo.map = '中华人民共和国'
                this.changeData({...config,customize:{...config.customize,level:'country',scope:'中国'}})
                echarts.registerMap('中华人民共和国', map);
                this.charts.setOption(option, true);

              }
            },)
          // })
          }
      const mapUrl = `${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/${config.customize.level}/${config.customize.dataMap}`
      const map = await this.$dataRoomAxios.get(decodeURI(mapUrl), {}, true)
      echarts.registerMap(config.customize.scope, map)
      this.charts.setOption(option)
      this.charts.on('click',  async(params)=> {
          const index = option.graphic.findIndex(i => i.style.text === params.name);
          if(params.name=='' || index !== -1) return
          if(config.customize.down===false||this.level==='province') return
          const idx = option.graphic.length + 1;
          option.graphic.push({
            type: "text",
            left: `${idx * 220}px`,
            top: "5%",
            style: {
                text: params.name,
                font: `bolder ${config.customize.fontSize}px "Microsoft YaHei", sans-serif`,
                fill: config.customize.fontGraphicColor,
            },
            onclick: async() => {
                const mapUrl =`${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/${params.name=='中华人民共和国'?'country':'province'}/${params.name}.json`
                const map = await this.$dataRoomAxios.get(decodeURI(mapUrl), {}, true)
                // 利用函数的作用域，可以直接拿上面的name来用
                const index = option.graphic.findIndex(i => i.style.text === params.name);
                // 点击元素之后的所有元素全部删除
                option.graphic.splice(index + 1);
                // 很多操作重复了，你可以将公共部分抽离出来
                option.geo.map = params.name;
                this.changeData({...config,customize:{...config.customize,level:'province',scope:params.name}})
                echarts.registerMap(params.name, map);
                this.charts.setOption(option, true);
            },
        });
          this.level='province'
          const mapUrl =`${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/province/${params.name}.json`
          const map = await this.$dataRoomAxios.get(decodeURI(mapUrl), {}, true)
          this.changeData({...config,customize:{...config.customize,level:'province',scope:params.name}})
          option.geo.map = params.name
          echarts.registerMap(params.name, map);
          this.charts.setOption(option, true);
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
</style>
