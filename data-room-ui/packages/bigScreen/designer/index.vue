<template>
  <div
    class="dataroom-bigscreen-design-wrap"
  >
    <Header
      v-show="headerShow"
      ref="header"
      :right-fold="rightVisiable"
      @updateRightVisiable="updateRightVisiable"
      @changeZoom="changeScreenZoom"
      @empty="empty"
      @toggleRightPanel="toggleRightPanel"
    />
    <div class="drag-wrap">
      <!-- 左侧面板 -->
      <LeftPanel
        :header-show="headerShow"
        :height="height"
        @toggleLeftSidebar="toggleLeftSidebar"
      />
      <!-- 中间组件展示面板 -->
      <Canvas
        v-if="isReady"
        ref="canvas"
      />
      <!-- 右侧折叠设置面板   -->
      <RightPanel
        :height="height"
        :right-visiable.sync="rightVisiable"
        :page-info-visiable="pageInfoVisiable"
        @updatePage="updatePage"
      />
    </div>
    <!-- 组件交互动作触发的弹窗 -->
    <canvas-dialog
      ref="canvasDialog"
    />
  </div>
</template>
<script>
import { getDeclaration } from '../components/configInstall'
import cloneDeep from 'lodash/cloneDeep'
import { getNodeByTree, randomString, replaceElement, deleteNodesWithCodes } from '@gcpaas/data-room-ui/packages/js/utils'
import { getPageInfo } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
const LeftPanel = () => import(/* webpackChunkName: "LeftPanel" */ './left/index.vue')
const Canvas = () => import(/* webpackChunkName: "Canvas" */ './canvas/index.vue')
const RightPanel = () => import(/* webpackChunkName: "RightPanel" */ './right/index.vue')
const Header = () => import(/* webpackChunkName: "Header" */ './header/index.vue')
const CanvasDialog = () => import(/* webpackChunkName: "Header" */ '../common/CanvasDialog/index.vue')
export default {
  name: 'BigScreenDesign',
  components: {
    Header,
    LeftPanel,
    Canvas,
    RightPanel,
    CanvasDialog
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    headerShow: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: 'calc(100vh - 40px)'
    }
  },
  data () {
    return {
      timers: {}, // 计时器
      chartInst: {},
      isReady: false,
      activeChart: {},
      pageInfo: null,
      isScreenSet: false, // 设置面板是大屏设置还是组件设置
      rightVisiable: false,
      pageInfoVisiable: false,
      globalVariableTimers: {}, // 全局变量定时器
      dataHandleFilters: {},
      zoom: 100,
      // 自适应下的缩放比例
      fitZoom: 100
    }
  },
  // 注入
  provide () {
    return {
      canvasInst: this.canvasInst
    }
  },
  computed: {
    currentPageType () {
      return this.$route.path === (window.SITE_CONFIG.dataRoom?.routers?.bigScreenDesignUrl || '/big-screen/design') ? 'bigScreen' : 'dashBoard'
    },
    pageCode () {
      return this.code || this.$route.query.code
    },
    scale () {
      return this.zoom / 100
    },
    canvasInst () {
      return this
    },
    pageConfig: {
      get () {
        return this.pageInfo?.pageConfig
      },
      set (value) {

      }

    },
    chartList: {
      get () {
        return this.pageInfo?.chartList
      },
      set () {

      }

    },
    dialogChartList: {
      get () {
        return this.pageInfo?.dialog?.chartList
      },
      set () {

      }

    },
    dialogStyle: {
      get () {
        return this.pageInfo?.dialog?.dialogStyle
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
        return this.pageInfo?.interactions || []
      },
      set () {

      }

    },

    coverageList () {
      return this.chartList.map(item => {
        return {
          code: item.code,
          title: item.title,
          type: item.type,
          icon: this.getCategoryIcon(item.type)
        }
      })
    }
  },
  created () {
    this.PageInfoInit()
  },
  mounted () {
  },
  methods: {
    // 初始化页面信息
    PageInfoInit () {
      getPageInfo(this.pageCode).then(res => {
        this.pageInfo = res
        this.pageInfo.filters = this.pageInfo.filters || {}
        this.pageInfo.chartList = this.pageInfo.chartList || []
        this.pageInfo.globalVariable = this.pageInfo.globalVariable || []
        this.pageInfo.globalNameToValue = {}
        // 配置兼容
        this.configCompatibility()
        this.isReady = true
        this.pageInfo.pageConfig.opacity = this.pageInfo?.pageConfig?.opacity || 1
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
        this.getDataScript()
        this.getGlobalNameToValue()
        this.openGlobalVariableTimer()
        this.triggerTimer()
      }).catch(err => {
        console.log(err)
      })
    },
    // 配置兼容
    configCompatibility () {
      Promise.all(this.pageInfo?.chartList?.map(item => {
        return getDeclaration(item.type).then(configModule => {
          let config = cloneDeep(configModule)
          config = {
            ...config,
            ...item
          }
          return config
        }).catch(err => {
          console.log(err)
          return item
        })
      })).then(newChartList => {
        this.pageInfo.chartList = newChartList
      })
    },
    // 更新页面信息
    updatePageInfo (pageInfo) {
      this.pageInfo = pageInfo
    },
    // 更新整个chartList
    updateChartList (chartList) {
      this.pageInfo.chartList = chartList
    },
    // 更新单个chart配置
    updateChartConfig (chartConfig) {
      // 需要区分一下改变的是系统内置组件还是弹窗组件
      if (!chartConfig.isDialogCom) {
        // 更新系统内置组件
        replaceElement(this.chartList, chartConfig)
      } else {
        // 更新弹窗组件
        const index = this.pageInfo?.dialog.chartList.findIndex(item => item.code === chartConfig.code)
        if (index > -1) {
          this.$set(this.pageInfo?.dialog.chartList, index, chartConfig)
        }
      }
      // 改变组件时同步改变交互列表中对应组件的名称
      if (this.pageInfo.interactions && this.pageInfo.interactions.length) {
        const index = this.pageInfo.interactions.findIndex(item => item.code === chartConfig.code)
        if (index > -1) {
          this.$set(this.pageInfo.interactions[index], 'name', chartConfig.title.text)
        }
      }
    },
    // 更新画布上被激活的组件
    updateActiveChart (activeCode) {
      // const activeChart = this.chartList.find(item => item.code === activeCode)
      const activeChart = getNodeByTree(this.chartList, activeCode, 'code')
      if (activeChart) {
        this.activeChart = activeChart
      } else {
        this.activeChart = null
      }
    },
    // 新增组件
    addChart (element, addType = 'add') {
      // 如果是从左侧新增的，根据拖拽的基本信息来获取组件的完整配置
      if (addType === 'add') {
        getDeclaration(element.type).then(configModule => {
          let config = cloneDeep(configModule)
          config = {
            ...config,
            width: config.w * this.scale,
            height: config.h * this.scale,
            code: !element.code ? randomString(8) : element.code
          }
          this.chartList.push(config)
        }).catch(err => {
          console.log(err)
        })
      } else {
        // 如果是复制的，那么element则是组建的完整配置
        this.chartList.push({ ...element, code: randomString(8) })
      }
    },
    // 删除组件(删除单个或者批量删除)
    deleteChart (codeList) {
      // 根据codeList删除chartList中对应的组件
      this.chartList = deleteNodesWithCodes(this.chartList, codeList)
      // 删除组件的时候将其对应的交互信息删除
      codeList.forEach(code => {
        this.deleteInteractions(code)
      })
    },
    changeIsScreenSet (isScreenSet) {
      this.isScreenSet = isScreenSet
    },
    // 点击当前组件时打开右侧面板
    openRightPanel () {
      this.rightVisiable = true
      this.pageInfoVisiable = false
      this.$refs.canvas.$refs.Rules.initRuleHeight()
    },
    // 切换右侧面板显隐
    toggleRightPanel () {
      // 如果没有激活的组件，则右侧面板显示大屏页面内容
      this.isScreenSet = !(this.activeChart && this.activeChart.code)
      this.rightVisiable = !this.rightVisiable
      this.pageInfoVisiable = !this.pageInfoVisiable
      this.$refs.canvas.$refs.Rules.initRuleHeight()
    },
    /**
       * @description: 清空页面
       */
    empty () {
      this.$confirm('确定清空页面吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(() => {
          if (!this.isScreenSet) {
            this.rightVisiable = false
            this.pageInfoVisiable = false
          }
          // 清空组件的话将组件对应交互也删除
          this.pageInfo.chartList.forEach(chart => {
            this.deleteInteractions(chart.code)
          })
          this.updateChartList([])
        })
        .catch(() => {})
    },
    // 缩放
    changeZoom (zoom) {
      this.zoom = zoom
    },
    changeFitZoom (zoom) {
      this.fitZoom = zoom
    },
    changeScreenZoom (zoom) {
      // 自适应
      if (zoom === 'auto') {
        this.$refs.Rules.initZoom()
      } else {
        this.changeZoom(zoom)
      }
    },
    // 改变大屏自适应（缩放）方式
    changePageConfig (pageConfig) {
      this.pageInfo.pageConfig = cloneDeep(pageConfig)
    },
    updateRightVisiable (visiable) {
      this.rightVisiable = visiable
      this.$refs.Rules.initRuleHeight()
    },
    toggleLeftSidebar () {
      this.$refs.Rules.initRuleHeight()
    },
    // 页面信息更改
    updatePage () {
      this.$refs.Rules.initZoom()
    },
    // 组件样式修改
    updateStyleHandler (config) {
      if (this.chartInst.hasOwnProperty(config.code)) {
        this.chartInst[config.code].updateChartStyle()
      }
    },
    // 组件数据修改
    updateDataHandler (config) {
      if (this.chartInst.hasOwnProperty(config.code)) {
        this.chartInst[config.code].updateChartData()
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
    // 修改页面的脚本：
    updateDataScript (id, filter) {
      this.$set(this.pageInfo.filters, id, { ...filter })
      this.dataHandleFilters[id] = new Function('params', 'canvasInst', filter.script)
    },
    // 更新全局变量
    setGlobalValue (id, value) {
      this.pageInfo.globalNameToValue[id].value = value
    },
    // 初始化获取全局变量的映射列表
    getGlobalNameToValue () {
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
    },
    // 更新全局变量映射列表
    updateGlobalNameToValue (variable, value) {
      this.pageInfo.globalNameToValue[variable.id] = {
        name: variable.name,
        value: value
      }
    },
    // 修改交互列表
    updateInteractions (interactions) {
      this.pageInfo.interactions = interactions
    },
    // 根据code删除交互列表
    deleteInteractions (code) {
      this.pageInfo.interactions = this.pageInfo?.interactions?.filter(item => item.code !== code) || []
    },
    // 将画布上的组件实例保存起来
    updateChartInst (code, chartInstItem) {
      this.chartInst[code] = chartInstItem
    },
    // 根据code获取实例
    getChartInst (code) {
      return this.chartInst[code]
    },
    // 获取事件列表
    getChartEvens (code) {
      return this.pageInfo.interactions?.find(item => item.code === code)?.children
    },
    // 根据code删除弹窗组件
    deleteDialogComByCode (code) {
      const index = this.pageInfo?.dialog?.chartList.findIndex(item => item.code === code)
      this.pageInfo.dialog?.chartList.splice(index, 1)
      this.deleteInteractions(code)
    },
    // 更新弹窗整个chartList
    updateDialogChartList (chartList) {
      // 清空组件的话将组件对应交互也删除
      chartList.forEach(chart => {
        this.deleteInteractions(chart.code)
      })
      this.pageInfo.dialog.chartList = chartList
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
    openGlobalVariableTimer () {
      this.canvasInst.pageInfo.globalVariable.forEach(variable => {
        this.triggerGlobalVariableTimer(variable)
      })
    },
    triggerGlobalVariableTimer (variable) {
      // 自动更新全局变量的值
      if (variable.autoUpdate) {
        // 判断该全局变量是否有已存在的定时器
        if (this.globalVariableTimers[variable.id]) {
          // 先销毁再新建
          clearInterval(this.globalVariableTimers[variable.id]) // 调用 clearInterval 来终止定时器的执行
        }
        this.globalVariableTimers[variable.id] = setInterval(() => {
          const newValue = this.canvasInst.dataHandleFilters[variable.filterId](variable.initialValue) || variable.initialValue
          this.canvasInst.setGlobalValue(variable.id, newValue)
        }, variable.updateFrequency * 1000)
      } else {
        if (this.globalVariableTimers[variable.id]) {
          clearInterval(this.globalVariableTimers[variable.id]) // 调用 clearInterval 来终止定时器的执行
        }
      }
    },
    // 新增弹窗组件
    addDialogChartList (element) {
      this.pageInfo.dialog.chartList.push(element)
    },
    // 更新画布弹窗的统一配置
    updateDialogStyle (dialogStyle) {
      this.$set(this.pageInfo?.dialog, 'dialogStyle', dialogStyle)
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
    // 图层显示组件的分类图标
    getCategoryIcon (type) {
      //  TODO 需要递归找到组件的分类图标
      switch (type) {
        case 'texts':
          return 'el-icon-tickets'
        case 'bar':
          return 'el-icon-s-data'
        case 'line':
          return 'el-icon-s-data'
        default:
          return 'el-icon-s-data'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .dataroom-bigscreen-design-wrap {
    overflow: hidden;
    height: 100vh;
    background-color: var(--bs-background-2);
    .drag-wrap {
      display: flex;
      background-color: var(--bs-background-2);
      height: calc(100vh - 40px);

      ::v-deep .el-loading-mask {
        background-color: transparent !important;
      }
    }
  }
</style>
