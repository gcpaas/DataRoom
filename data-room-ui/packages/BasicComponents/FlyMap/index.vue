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
      config.option = {
        ...config.option,
        data: data?.data
      }
      return config
    },
    async newChart (config) {
      this.charts = echarts.init(
        document.getElementById(`chart${this.config.code}`)
      )

      const lines_coord = []
      let fromCoord=[]
      let coord=[]
      const mapUrl =config.customize.level==='world'?`${window.BS_CONFIG?.httpConfigs?.baseURL}/static/worldMap/world.json`:`${window.BS_CONFIG?.httpConfigs?.baseURL}/static/chinaMap/${config.customize.level}/${config.customize.dataMap}`
      this.$dataRoomAxios.get(decodeURI(mapUrl), {}, true).then(res=>{
        this.config.option.data.forEach(val => {
          lines_coord.push({value:val.value,msg:{...val}, coords:[[val.lat1,val.lng1],[val.lat2,val.lng2]]})
          if(val.type==='move_in'){
            coord.push({name:val.from,value:[val.lat1,val.lng1,val.value],msg:{...val}})
            fromCoord.push({name:val.to,value:[val.lat2,val.lng2,val.value],msg:{...val}})
          }
          if(val.type==='move_out'){
            coord.push({name:val.to,value:[val.lat2,val.lng2,val.value],msg:{...val}})
            fromCoord.push({name:val.from,value:[val.lat1,val.lng1,val.value],msg:{...val}})
          }
        })
        echarts.registerMap(config.customize.scope, res)
        const option = {
          // nameMap: nameMap,
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
                type:'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 15,
                symbolSize:8,
                rippleEffect: {
                    period: 4, brushType: 'stroke', scale: 4
                },
                 tooltip: {
                    trigger: 'item',
                    formatter(params) {
                    const a= eval(config.customize.scatterFormatter)
                      return a
                    },
                },
                itemStyle:{
                    color:config.customize.scatterColor,
                    opacity:1
                },
                data:coord
            },
            {
                type:'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 15,
                symbolSize:12,
                tooltip: {
                  trigger: 'item',
                  formatter(params) {
                   const a= eval(config.customize.scatterFormatter)
                    return a
                  },
                },
                rippleEffect: {
                    period: 6, brushType: 'stroke', scale: 8
                },

                itemStyle:{
                    color:config.customize.scatterCenterColor,
                    opacity:1
                },
                data:fromCoord
            },
            {
                type:'lines',
                coordinateSystem:'geo',
                zlevel: 15,
                tooltip: {
                  trigger: 'item',
                  formatter(params) {
                   const a= eval(config.customize.lineFormatter)
                    return a
                  },
                },
                effect: {
                    show: true, period: 5, trailLength: 0, symbol: config.customize.symbol,  color:config.customize.symbolColor,symbolSize: config.customize.symbolSize,
                },
                lineStyle: {
                  normal: {color: function(value){
                      return '#ffffff'
                  },width: 2, opacity: 0.6, curveness: 0.2 }
                },
                data:lines_coord
            }

          ]
        }
        if (config.customize.visual) {
          option.visualMap = {
            show: false,
            min: config.customize.range[0],
            max: config.customize.range[1],
            seriesIndex: [0,2],
            inRange: {
              color: config.customize.rangeColor
            }
          }
        }
        if(config.customize.down){
            config?.customize?.graphic?.forEach((item,index)=>{
            option.graphic.push({
              type: "text",
              left: `${(index+1) * 200}px`,
              top: "2%",
              style: {
                  text: item,
                  font: `bolder ${config.customize.fontSize}px "Microsoft YaHei", sans-serif`,
                  fill: config.customize.fontGraphicColor,
              },
              onclick:()=>{
                console.log(item,item=='中华人民共和国'?'country': 'province')
                const arr=config.customize.graphic.slice(0,index+1)
                console.log(arr,config.customize.graphic)
                this.$store.commit('bigScreen/changeActiveItemConfig', { ...config, customize: { ...config.customize,dataMap:`${item}.json`,graphic:[...arr],level:item=='中华人民共和国'?'country': 'province'}})
              }
            },)
          })
          }
        this.charts.setOption(option)
         this.charts.on('click',  (params)=> {
          if(params.name=='') return
          if(config.customize.down===false||config.customize.level==='province') return
          this.$store.commit('bigScreen/changeActiveItemConfig', { ...config, customize: { ...config.customize,dataMap:`${params.name}.json`,graphic:[...config.customize.graphic,params.name], level:config.customize.level==='country'?'province':'country'} })
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
</style>
