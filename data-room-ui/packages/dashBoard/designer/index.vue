<template>
  <div
    class="dataroom-dashboard-design-wrap"
  >
    <Header
      v-show="headerShow"
      ref="header"
      :right-fold="rightVisiable"
      @updateRightVisiable="updateRightVisiable"
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
      />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { getDeclaration } from '../components/configInstall'
import cloneDeep from 'lodash/cloneDeep'
import { deleteNodesWithCodes, getNodeByTree, randomString, replaceElement } from '@gcpaas/data-room-ui/packages/js/utils'
import defaultPageInfo from '../components/pageInfo'
import { getPageInfo } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
const LeftPanel = () => import(/* webpackChunkName: "LeftPanel" */ './left/index.vue')
const Canvas = () => import(/* webpackChunkName: "Canvas" */ './canvas/index.vue')
const RightPanel = () => import(/* webpackChunkName: "RightPanel" */ './right/index.vue')
const Header = () => import(/* webpackChunkName: "Header" */ './header/index.vue')
export default {
  name: 'DashBoardDesign',
  components: {
    Header,
    LeftPanel,
    Canvas,
    RightPanel
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
      chartInst: {},
      isReady: false,
      pageInfo: null,
      isScreenSet: false, // 设置面板是大屏设置还是组件设置
      activeChart: {},
      mouseInDesign: false,
      mapShow: true, // 小地图显示与否
      rightVisiable: false,
      dataHandleFilters: {},
      pageInfoVisiable: false
    }
  },
  // 注入
  provide () {
    return {
      canvasInst: Vue.observable(this.canvasInst)
    }
  },
  computed: {
    canvasInst () {
      return this
    },
    currentPageType () {
      return this.$route.path === (window.SITE_CONFIG.dataRoom?.routers?.bigScreenDesignUrl || '/big-screen/design') ? 'bigScreen' : 'dashBoard'
    },
    pageCode () {
      return this.code || this.$route.query.code
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
        // 配置兼容
        this.configCompatibility()
        this.isReady = true
        this.pageInfo.filters = this.pageInfo.filters || {}
        this.pageInfo.pageConfig.opacity = this.pageInfo?.pageConfig?.opacity || 1
        this.getDataScript()
      }).catch(err => {
        console.log(err)
      })
    },
    // 配置兼容
    configCompatibility () {
      Promise.all(this.pageInfo.chartList.map(item => {
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
    // 根据code获取实例
    getChartInst (code) {
      return this.chartInst[code]
    },
    // 将画布上的组件实例保存起来
    updateChartInst (code, chartInstItem) {
      this.chartInst[code] = chartInstItem
    },
    updatePageInfo (pageInfo) {
      this.pageInfo = pageInfo
    },
    // 更新整个chartList
    updateChartList (chartList) {
      this.pageInfo.chartList = chartList
    },
    // 更新单个chart配置
    updateChartConfig (chartConfig) {
      replaceElement(this.chartList, chartConfig)
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
      const random = randomString(8)
      // 如果是从左侧新增的，根据拖拽的基本信息来获取组件的完整配置
      if (addType === 'add') {
        // 根据拖拽的基本信息来获取组件的完整配置
        getDeclaration(element.type).then(configModule => {
          let config = cloneDeep(configModule)
          config = {
            ...config,
            width: config.w * this.scale,
            height: config.h * this.scale,
            code: !element.code ? random : element.code,
            i: !element.code ? random : element.code
          }
          this.chartList.push(config)
        }).catch(err => {
          console.log(err)
        })
      } else {
        // 如果是复制的，那么element则是组建的完整配置
        this.chartList.push({
          ...element,
          code: random,
          i: random
        })
      }
    },
    // 删除组件(删除单个或者批量删除)
    deleteChart (codeList) {
      // 根据codeList删除chartList中对应的组件
      this.chartList = deleteNodesWithCodes(this.chartList, codeList)
    },
    changeIsScreenSet (isScreenSet) {
      this.isScreenSet = isScreenSet
    },
    // 获取事件列表
    getChartEvens (code) {
      return this.pageInfo.interactions?.find(item => item.code === code)?.children
    },
    // 点击当前组件时打开右侧面板
    openRightPanel () {
      this.rightVisiable = true
      this.pageInfoVisiable = false
    },
    // 切换右侧面板显隐
    toggleRightPanel () {
      // 如果没有激活的组件，则右侧面板显示大屏页面内容
      this.isScreenSet = !(this.activeChart && this.activeChart.code)
      this.rightVisiable = !this.rightVisiable
      this.pageInfoVisiable = !this.pageInfoVisiable
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
          this.updateChartList([])
          // 关闭右侧面板
        })
        .catch(() => {})
    },
    updateRightVisiable (visiable) {
      this.rightVisiable = visiable
    },
    toggleLeftSidebar () {
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
          this.dataScripts[key] = new Function('params', this.pageInfo.filters[key].script)
        }
      }
    },
    // 修改页面的脚本：
    updateDataScript (id, filter) {
      this.pageInfo.filters[id] = {
        name: '',
        script: filter
      }
      this.dataScripts[id] = new Function('params', filter)
    },
    // 遍历组件树，找到需要修改样式的组件，并调用其 changeStyle 方法
    traverseComponents (component, config, eventType, isData, data) {
      const targetCode = config.code
      if (!component) {
        return
      }

      // 找到当前组件的 ref
      const targetRef = component.$refs[targetCode]

      // 如果找到了 ref，并且 ref 具有 changeStyle 方法，则调用
      if (targetRef) {
        if (eventType === 'updateChartStyle') {
          targetRef.updateChartStyle(config)
        } else if (eventType === 'updateChartData') {
          targetRef.updateChartData(config, isData, data)
        }
      }
      // 递归遍历子组件
      if (component.$children && component.$children.length > 0) {
        component.$children.forEach(childComponent => {
          this.traverseComponents(childComponent, config, eventType, isData, data)
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
  .dataroom-dashboard-design-wrap {
    overflow: hidden;
    height: 100vh;
      .canvas-wrap {
        width: 100px;
      }
    .drag-wrap {
      display: flex;
      background-color: #ffffff;
      height: calc(100vh - 40px);

      ::v-deep .el-loading-mask {
        background-color: transparent !important;
      }
    }

    .footer-wrap{
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background-color: #ffffff;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
