<template>
  <div
    id="previewWrap"
    class="dataroom-bigscreen-preview-wrap"
    :style="screenWrapStyle"
  >
    <div
      id="previewBox"
      class="bs-preview-box"
      :style="screenRunStyle"
    >
      <div
        v-for="chart in chartList"
        :key="chart.code"
        :style="getStyle(chart)"
        class="chart-item-box"
      >
        <Configuration
          :config="chart"
        >
          <RenderCard
            ref="RenderCardRef"
            :key="chart.key"
            :config="chart"
          />
        </Configuration>
      </div>
    </div>
    <!-- 组件交互动作触发的弹窗 -->
    <canvas-dialog
      ref="canvasDialog"
    />
  </div>
</template>
<script>

import Vue from 'vue'
import { randomString, replaceElement } from '@gcpaas/data-room-ui/packages/js/utils'
import { getPageInfo } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
import CanvasDialog from '@gcpaas/data-room-ui/packages/bigScreen/common/CanvasDialog/index.vue'
const Configuration = () => import('@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/Configuration.vue')
const RenderCard = () => import('@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/RenderCard.vue')
export default {
  name: 'BigScreenRun',
  components: {
    CanvasDialog,
    Configuration,
    RenderCard
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({
      })
    }
  },
  data () {
    return {
      pageInfo: null,
      dataHandleFilters: {},
      timers: {}, // 计时器
      chartInst: {},
      pageConfig: {},
      chartList: [],
      globalVariableTimers: {}, // 更新全局变量的计时器
      fitMode: '',
      autofill: false,
      screenRunStyle: {},
      screenWrapStyle: {},
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth
    }
  },
  // 注入
  provide () {
    return {
      canvasInst: Vue.observable(this.canvasInst)
    }
  },
  computed: {
    isVisit () {
      return this.$route.query.isVisit || false
    },
    pageCode () {
      return this.code || this.$route.query.code
    },
    dialogChartList: {
      get () {
        return this.pageInfo?.dialog.chartList
      },
      set () {

      }

    },
    dialogStyle: {
      get () {
        return this.pageInfo?.dialog.dialogStyle
      },
      set () {

      }

    },
    filters: {
      get () {
        return this.pageInfo?.filters
      },
      set () {

      }

    },
    interactions: {
      get () {
        return this.pageInfo?.interactions
      },
      set () {

      }

    },
    canvasInst () {
      return this
    }
  },
  watch: {
  },
  created () {

  },
  mounted () {
    this.PageInfoInit()
    this.windowSize()
  },
  beforeDestroy () {
  },
  methods: {
    // 初始化页面信息
    PageInfoInit () {
      const url = this.isVisit ? `/dataroom/design/info/code/${this.pageCode}` : `/dataroom/design/info/code/${this.pageCode}?preview=true`
      this.$dataRoomAxios.get(url).then(res => {
        this.pageInfo = res
        this.pageConfig = this.pageInfo?.pageConfig || {}
        this.chartList = this.pageInfo?.chartList || []
        this.fitMode = this.pageConfig.fitMode || 'auto'
        this.autofill = this.pageConfig.autofill || false
        this.screenWrapStyle = this.pageConfig.autofill ? {
          backgroundColor: this.pageConfig.bgColor,
          opacity: this.pageConfig.opacity
        } : {
          backgroundColor: '#fff'
        }
        this.screenRunStyle = {
          backgroundColor: this.pageConfig.bgColor || '#fff',
          width: this.pageConfig.w + 'px' || 1920 + 'px',
          height: this.pageConfig.h + 'px' || 1080 + 'px',
          opacity: this.pageConfig.opacity || 1,
          transform: 'scaleX(1) scaleY(1)'
        }
        this.pageInfo.dialog = this.pageInfo?.dialog || {
          dialogStyle: {
            width: 80,
            height: 500,
            fullPage: false,
            title: {
              content: '弹窗',
              fontSize: 20,
              fontColor: '#000',
              bgColor: '#eee',
              height: 50
            },
            body: {
              bgColor: '#fff',
              padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
              }
            },
            buttons: [{
              name: '确定',
              code: 'confirm'
            }]
          },
          chartList: []
        }
        this.pageInfo.filters = this.pageInfo?.filters || {}
        this.pageInfo.globalNameToValue = {}
        this.getGlobalNameToValue()
        this.getDataScript()
        this.screenFixInit()
        this.triggerGlobalVariableTimer()
        this.triggerTimer()
      }).catch(err => {
        console.log(err)
      })
    },
    // 获取事件列表
    getChartEvens (code) {
      return this.pageInfo.interactions?.find(item => item.code === code)?.children
    },
    // 更新chartList
    updateChartList (chartList) {
      this.chartList = chartList
    },
    // 初始化获取全局变量的映射列表
    getGlobalNameToValue () {
      if (this.pageInfo.globalVariable && this.pageInfo.globalVariable.length) {
        this.pageInfo.globalVariable.forEach(variable => {
          if (variable.source === 'fromURL') {
            // 获取URL中获取对应的值
            const value = this.$route.query[variable.name]
            this.pageInfo.globalNameToValue[variable.id] = {
              name: variable.name,
              value: value
            }
          } else {
            this.pageInfo.globalNameToValue[variable.id] = {
              name: variable.name,
              value: variable.initialValue
            }
          }
        })
      }
    },
    // 更新全局变量
    setGlobalValue (id, value) {
      this.pageInfo.globalNameToValue[id].value = value
    },
    // 更新全局变量映射列表
    updateGlobalNameToValue (variable, value) {
      this.pageInfo.globalNameToValue[variable.id] = {
        name: variable.name,
        value: value
      }
    },
    // 根据ID获取全局变量
    getGlobalValueById (id) {
      const variable = this.pageInfo.globalVariable.find(item => item.id === id)
      if (variable && variable.filterId) {
        return this.dataHandleFilters[variable.filterId](this.pageInfo.globalNameToValue[variable.id].value) || this.pageInfo.globalNameToValue[variable.id].value
      } else {
        return this.pageInfo.globalNameToValue[variable.id].value
      }
    },
    // 根据name获取全局变量
    getGlobalValueByName (name) {
      const variable = this.pageInfo.globalVariable.find(item => item.name === name)
      if (variable && variable.filterId) {
        return this.dataHandleFilters[variable.filterId](this.pageInfo.globalNameToValue[variable.id].value) || this.pageInfo.globalNameToValue[variable.id].value
      } else {
        return this.pageInfo.globalNameToValue[variable.id].value
      }
    },
    // 触发更新全局变量的定时器
    triggerGlobalVariableTimer () {
      this.canvasInst.pageInfo.globalVariable.forEach(variable => {
        // 自动更新全局变量的值
        if (variable.autoUpdate) {
          // 判断该全局变量是否有已存在的定时器
          if (this.globalVariableTimers[variable.id]) {
            // 先销毁再新建
            clearInterval(this.globalVariableTimers[variable.id]) // 调用 clearInterval 来终止定时器的执行
          }
          this.globalVariableTimers[variable.id] = setInterval(() => {
            const newValue = this.dataHandleFilters[variable.filterId](variable.initialValue) || variable.initialValue
            this.canvasInst.setGlobalValue(variable.id, newValue)
          }, variable.updateFrequency * 1000)
        } else {
          if (this.globalVariableTimers[variable.id]) {
            clearInterval(this.globalVariableTimers[variable.id]) // 调用 clearInterval 来终止定时器的执行
          }
        }
      })
    },
    // 根据code获取实例
    getChartInst (code) {
      return this.chartInst[code]
    },
    // 将画布上的组件实例保存起来
    updateChartInst (code, chartInstItem) {
      this.chartInst[code] = chartInstItem
    },
    // 打开弹窗
    openDialog (dialogConfig) {
      this.$nextTick(() => {
        this.$refs.canvasDialog.init(dialogConfig)
      })
    },
    // 触发定时器
    triggerTimer () {
      // 销毁定时器
      for (const timeId in this.timers) {
        if (this.timers.hasOwnProperty(timeId)) {
          clearInterval(this.timers[timeId])
        }
      }
      // const chartInst = this.chartInst
      // 获取定时器列表
      const timerList = this.pageInfo?.interactions?.find(item => item.code === 'global')?.children?.filter(i => i.trigger === 'timer')
      if (timerList && timerList.length) {
        timerList.forEach(timer => {
          // 如果存在脚本
          if (timer.filterId) {
            // 如果是循环的定时器
            if (timer.loop) {
              // 如果是延迟的
              if (timer.method === 'delay') {
                this.timers[timer.code] = setInterval(() => {
                  // 执行逻辑
                  this.dataHandleFilters[timer.filterId]({}, this.canvasInst)
                }, timer.delay * 1000)
              } else {
                // 到了约定的事件开始执行
                this.timers[timer.code] = setInterval(() => {
                  // 执行逻辑
                  if (new Date().getTime() >= timer.time) {
                    this.dataHandleFilters[timer.filterId]({}, this.canvasInst)
                  }
                }, timer.delay * 1000)
              }
            } else {
              // 如果是单次的定时器
              // 如果是延迟的
              if (timer.method === 'delay') {
                this.timers[timer.code] = setTimeout(() => {
                  // 执行逻辑
                  this.dataHandleFilters[timer.filterId]({}, this.canvasInst)
                }, timer.delay * 1000)
              } else {
                this.timers[timer.code] = setInterval(() => {
                  // 到了约定的事件开始执行,不间断的判断
                  if (new Date().getTime() >= timer.time) {
                    // 执行逻辑
                    this.dataHandleFilters[timer.filterId]({}, this.canvasInst)
                    clearInterval(this.timers[timer.code]) // 调用 clearInterval 来终止定时器的执行
                  }
                }, 1000)
              }
            }
          }
        })
      }
    },
    // 更新单个chart配置
    updateChartConfig (chartConfig) {
      replaceElement(this.chartList, chartConfig)
    },
    // 更新画布弹窗的统一配置
    updateDialogStyle (dialogStyle) {
      this.$set(this.pageInfo?.dialog, 'dialogStyle', dialogStyle)
    },
    getStyle (chart) {
      return {
        position: 'absolute',
        width: chart.w + 'px',
        height: chart.h + 'px',
        // left: chart.x + 'px',
        // top: chart.y + 'px',
        transform: chart.transform,
        zIndex: chart.z || 0
      }
    },
    // 监听窗口变化
    windowSize () {
      window.onresize = () => {
        const previewWrap = document.getElementById('previewWrap')
        if (previewWrap) {
          previewWrap.style.width = window.innerWidth + 'px'
          previewWrap.style.height = window.innerHeight + 'px'
        }

        this.screenFixInit()
      }
    },
    // 将页面中所有的数据脚本（数据过滤）都保存起来
    getDataScript () {
      if (this.pageInfo.filters) {
        for (const key in this.pageInfo.filters) {
          this.dataHandleFilters[key] = new Function('params', 'canvasInst', this.pageInfo.filters[key].script)
        }
      }
    },
    // 根据大屏的缩放方式来做相应处理
    screenFixInit () {
      const innerWidth = window.innerWidth
      const innerHeight = window.innerHeight
      // const scaleX = ((Math.floor((innerWidth / this.pageConfig.w) * 100) / 100)).toFixed(2)
      // const scaleY = ((Math.floor((innerHeight / this.pageConfig.h) * 100) / 100)).toFixed(2)
      const scaleX = innerWidth / this.pageConfig.w
      const scaleY = innerHeight / this.pageConfig.h
      const previewWrap = document.getElementById('previewWrap')
      const previewBox = document.getElementById('previewBox')
      switch (this.fitMode) {
        // 宽度铺满
        case 'fitWidth':
          previewBox.style.transform = `scale(${scaleX})`
          previewWrap.style.overflowX = 'hidden'
          // this.screenRunStyle = {
          //   ...this.screenRunStyle,
          //   transform: `scale(${scaleX})`,
          //   overflowX: 'hidden'
          //
          // }

          break
        // 高度铺满
        case 'fitHeight':
          previewBox.style.transform = `scale(${scaleY})`
          previewWrap.style.overflowY = 'hidden'
          // this.screenRunStyle = {
          //   ...this.screenRunStyle,
          //   transform: `scale(${scaleY})`,
          //   overflowY: 'hidden'
          //
          // }
          break
        // 高度铺满且居中
        case 'fitHeightCenter':
          previewBox.style.transform = `translate(-50%,-50%) scale(${scaleY})`
          previewBox.style.left = '50%'
          previewBox.style.top = '50%'
          previewBox.style.transformOrigin = 'unset'
          previewWrap.style.overflowX = 'hidden'
          previewWrap.style.overflowY = 'hidden'
          // this.screenRunStyle = {
          //   ...this.screenRunStyle,
          //   transform: `translate(-50%,-50%) scale(${scaleY})`,
          //   left: '50%',
          //   top: '50%',
          //   transformOrigin: 'unset',
          //   overflowX: 'hidden',
          //   overflowY: 'hidden'
          // }

          break
        // 全屏铺满
        case 'cover':
          previewBox.style.transform = `scale(${scaleX}, ${scaleY})`
          // this.screenRunStyle = {
          //   ...this.screenRunStyle,
          //   transform: `scale(${scaleX}, ${scaleY})`
          //
          // }
          break
        // 自适应
        case 'auto':
          // 比较屏幕跟大屏的宽高的缩放程度，小的进行缩放
          if (scaleX < scaleY) {
            previewBox.style.transform = `translate(-50%,-50%) scale(${scaleX})`
            previewBox.style.left = '50%'
            previewBox.style.top = '50%'
            previewBox.style.transformOrigin = 'unset'
            previewWrap.style.overflowX = 'hidden'
            // this.screenRunStyle = {
            //   ...this.screenRunStyle,
            //   transform: `translate(-50%,-50%) scale(${scaleX})`,
            //   left: '50%',
            //   top: '50%',
            //   transformOrigin: 'unset',
            //   overflowX: 'hidden'
            //
            // }
          } else {
            previewBox.style.transform = `translate(-50%,-50%) scale(${scaleY})`
            previewBox.style.left = '50%'
            previewBox.style.top = '50%'
            previewBox.style.transformOrigin = 'unset'
            previewWrap.style.overflowY = 'hidden'
            // this.screenRunStyle = {
            //   ...this.screenRunStyle,
            //   transform: `translate(-50%,-50%) scale(${scaleY})`,
            //   left: '50%',
            //   top: '50%',
            //   transformOrigin: 'unset',
            //   overflowY: 'hidden'
            //
            // }
          }

          break
        // 无
        case 'none':
      }
      this.screenRunStyle.transform = previewBox.style.transform
    }
  }
}
</script>

<style lang="scss" scoped>
  .dataroom-bigscreen-preview-wrap {
    position:absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
    .bs-preview-box{
      //width: 1920px;
      //height: 1080px;
      position: absolute;
      //overflow: auto;
      transform-origin: left top;
      overflow: hidden;
      .chart-item-box{
        box-sizing: border-box;
      }
    }

  }
</style>
