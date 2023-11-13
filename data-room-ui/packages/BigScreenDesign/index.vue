<template>
  <div
    v-if="hasPermission"
    class="bs-page-design-wrap"
  >
    <PageTopSetting
      v-show="headerShow"
      ref="PageTopSetting"
      :right-fold="rightVisiable"
      @updateRightVisiable="updateRightVisiable"
      @showPageInfo="showPageInfo"
      @changeZoom="changeScreenZoom"
      @empty="empty"
    />
    <div class="drag-wrap">
      <!-- 左侧面板 -->
      <LeftPanel
        :header-show="headerShow"
        :height="height"
        @openRightPanel="openRightPanel"
        @openResource="initDialog"
        @openComponent="openComponent"
        @toggleLeftSidebar="toggleLeftSidebar"
      />
      <!-- 中间组件展示面板 -->
      <div
        v-loading="pageLoading"
        class="grid-wrap-box"
        :style="{
          height: 'calc(100vh - 48px)'
        }"
        tabindex="1000"
        @keydown="designKeydown"
      >
        <div
          id="minimap"
          class="minimap"
        >
          <div class="mapHeader" id="mapHeader">
            <div>
              <span>小地图</span>
            </div>
            <div class="showMap" @click="showMinimap">
              <i class="el-icon-arrow-down" style="width:20px;height:20px;color:#fff;" v-if="!mapShow"/>
              <i class="el-icon-arrow-up" style="width:20px;height:20px;color:#fff;" v-if="mapShow"/>
            </div>
          </div>
          <div
            id="selectWin"
            class="selectWin"
            v-show="mapShow"
          >
            <div
              id="selectionWin"
              class="selectionWin"
            />
          </div>
        </div>
        <SketchDesignRuler
          ref="Rules"
          :width="3000"
          :height="3000"
          :page-width="pageConfig.w"
          :page-height="pageConfig.h"
          @changeStart="changeStart"
        >
          <MouseSelect
            :offset-x="offset.x"
            :offset-y="offset.y"
            @selectArea="onSelectArea"
          >
            <Render
              ref="Render"
              :class="{
                'grid-bg': hasGrid
              }"
              @openRightPanel="openRightPanel"
              @openDataViewDialog="openDataViewDialog"
            />
          </MouseSelect>
        </SketchDesignRuler>
        <!-- <div class="footer-tools-bar">
          <el-slider
            class="bs-slider-wrap"
            :value="zoom"
            :min="10"
            style="width: 200px; margin-right: 20px"
            @input="changeScreenZoom"
          />
          <span class="select-zoom-text">缩放比例</span>
          <el-select
            class="bs-el-select"
            popper-class="bs-el-select"
            :value="zoom"
            @change="changeScreenZoom"
          >
            <el-option
              v-for="(zoom,index) in zoomList"
              :key="index"
              :label="zoom.label"
              :value="zoom.value"
            />
          </el-select>
        </div> -->
      </div>
      <!-- 右侧折叠设置面板   -->
      <SettingPanel
        :header-show="headerShow"
        :height="height"
        :right-visiable.sync="rightVisiable"
        :page-info-visiable="pageInfoVisiable"
        @updateSetting="updateSetting"
        @updateDataSetting="updateDataSetting"
        @updatePage="updatePage"
        @styleHandler="styleHandler"
      >
        <template #dataSetSelect="{ value }">
          <slot
            name="dataSetSelect"
            :value="value"
          />
        </template>
      </SettingPanel>
      <!-- 添加资源面板 -->
      <SourceDialog
        ref="SourceDialog"
        @getImg="setImg"
      />
      <ComponentDialog
        ref="componentDialog"
        @setComponent="setComponent"
        @setRemoteComponent="setRemoteComponent"
      />
      <iframe-dialog
        v-if="iframeDialog"
        ref="iframeDialog"
      />
    </div>
    <data-view-dialog
      ref="dataViewDialog"
    />
  </div>
  <NotPermission v-else-if="!hasPermission" />
</template>
<script>
import SourceDialog from './SourceDialog/index.vue'
import ComponentDialog from './ComponentDialog/index.vue'
import iframeDialog from 'data-room-ui/BasicComponents/LinkChart/iframeDialog'
import {
  dataConfig,
  settingConfig
} from 'data-room-ui/BasicComponents/Picture/settingConfig'
import LeftPanel from './LeftPanel.vue'
import SettingPanel from './SettingPanel.vue'
import PageTopSetting from './PageDesignTop.vue'
import Render from '../Render'
import { mapActions, mapMutations, mapState } from 'vuex'
import SketchDesignRuler from 'data-room-ui/BigScreenDesign/RulerTool/SketchRuler.vue'
import multipleSelectMixin from 'data-room-ui/js/mixins/multipleSelectMixin'
import { getScreenInfo } from 'data-room-ui/js/api/bigScreenApi'
import plotSettings from 'data-room-ui/G2Plots/settings'
import MouseSelect from './MouseSelect/index.vue'
import cloneDeep from 'lodash/cloneDeep'
import { randomString } from '../js/utils'
import { isFirefox } from 'data-room-ui/js/utils/userAgent'
import { handleResData } from 'data-room-ui/js/store/actions.js'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import NotPermission from 'data-room-ui/NotPermission'
import DataViewDialog from 'data-room-ui/BigScreenDesign/DataViewDialog'
export default {
  name: 'BigScreenDesign',
  components: {
    PageTopSetting,
    LeftPanel,
    Render,
    SketchDesignRuler,
    MouseSelect,
    SettingPanel,
    SourceDialog,
    ComponentDialog,
    iframeDialog,
    NotPermission,
    DataViewDialog
  },
  mixins: [multipleSelectMixin],
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
      mapShow: true, // 小地图显示与否
      hasPermission: true,
      rightVisiable: false,
      pageInfoVisiable: false,
      ruleStartX: 100,
      ruleStartY: 100,
      zoomList: [
        {
          label: '自适应',
          value: 'auto'
        },
        {
          label: '100%',
          value: 100
        },
        {
          label: '80%',
          value: 80
        },
        {
          label: '50%',
          value: 50
        },
        {
          label: '20%',
          value: 20
        }
      ]
    }
  },
  watch: {
    chartList (val) {
      // if(val.findIndex(item=>item.code==this.activeCode)==-1){
      //   this.updateRightVisiable(false)
      // }
      // if(val.length==0){
      //   this.updateRightVisiable(false)
      // }
    },
    mapShow (value) {
      const mapElement = document.getElementById('minimap')
      // const selectElement = document.getElementById('selectWin')
      if (!value) {
        mapElement.style.bottom = parseFloat(window.getComputedStyle(mapElement).bottom) + 150 + 'px'
      } else {
        this.$refs.Rules.handleScroll()
        mapElement.style.bottom = parseFloat(window.getComputedStyle(mapElement).bottom) - 150 + 'px'
      }
    },
    fitZoom (zoom) {
      this.zoomList[0] = {
        label: `自适应(${zoom}%)`,
        value: zoom
      }
    }
  },
  computed: {
    ...mapState({
      pageInfo: (state) => state.bigScreen.pageInfo,
      chartList: (state) => state.bigScreen.pageInfo.chartList,
      pageConfig: (state) => state.bigScreen.pageInfo.pageConfig,
      pageLoading: (state) => state.bigScreen.pageLoading,
      hoverCode: (state) => state.bigScreen.hoverCode,
      presetLine: (state) => state.bigScreen.presetLine,
      updateKey: (state) => state.bigScreen.updateKey,
      hasGrid: (state) => state.bigScreen.hasGrid,
      zoom: (state) => state.bigScreen.zoom,
      fitZoom: (state) => state.bigScreen.fitZoom,
      iframeDialog: (state) => state.bigScreen.iframeDialog,
      activeCode: state => state.bigScreen.activeCode
    }),
    pageCode () {
      return this.code || this.$route.query.code
    },
    offset () {
      return {
        x: 220 + 50 - this.ruleStartX,
        y: 55 + 50 - this.ruleStartY
      }
    }
  },
  created () {
    this.changePageLoading(true)
    this.permission()
    /**
       * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
       * @param event
       */
    if (isFirefox()) {
      document.body.ondrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
  mounted () {
    EventBus.$on('closeRightPanel', () => {
      this.updateRightVisiable(false)
    })
  },
  beforeDestroy () {
    this.clearTimeline()
    EventBus.$off('closeRightPanel')
  },
  methods: {
    ...mapActions('bigScreen', ['initLayout']),
    ...mapMutations('bigScreen', [
      'changeLayout',
      'changePageLoading',
      'resetPresetLine',
      'changeActiveCode',
      'changeActiveCodes',
      'changePageConfig',
      'changeChartConfig',
      'changeChartKey',
      'changeZoom',
      'clearTimeline',
      'saveTimeLine',
      'changeIframeDialog',
      'changePageInfo',
      'changeActiveItemConfig',
      'emptyDataset',
      'emptyComputedDatas'
    ]),
    // 控制小地图显示与隐藏
    showMinimap () {
      this.mapShow = !this.mapShow
    },
    // 判断页面权限
    permission () {
      this.$dataRoomAxios.get(`/bigScreen/permission/check/${this.pageCode}`).then(res => {
        this.hasPermission = res
        if (res) {
          this.init()
        }
      })
    },
    // 添加资源弹窗初始化
    initDialog () {
      this.$refs.SourceDialog.init()
    },
    openComponent () {
      this.$refs.componentDialog.init()
    },
    // 从组件库添加组件模板到当前画布
    setComponent (component) {
      // 根据component获取页面详情
      getScreenInfo(component.code).then(res => {
        res.chartList.forEach((item) => {
          if (!item.border) {
            item.border = { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [0, 0, 0, 0] }
          }
          if (!item.border.padding) {
            item.border.padding = [0, 0, 0, 0]
          }
          if (item.type == 'customComponent') {
            plotSettings[Symbol.iterator] = function * () {
              const keys = Object.keys(plotSettings)
              for (const k of keys) {
                yield [k, plotSettings[k]]
              }
            }
            for (const [key, value] of plotSettings) {
              if (item.name == value.name) {
                const settings = JSON.parse(JSON.stringify(value.setting))
                item.setting = settings.map((x) => {
                  const index = item.setting.findIndex(y => y.field == x.field)
                  x.field = item.setting[index].field
                  x.value = item.setting[index].value
                  return x
                })
              }
            }
          }
        })
        // 给组件库导入的组件加入统一的前缀
        const randomStr = randomString(8)
        const pageInfo = handleResData(res)
        const chartList = pageInfo.chartList.reverse()
        chartList.forEach((chart) => {
          // 如果组件存在数据联动，则将数据联动的code也加上相同的前缀
          if (chart.linkage && chart.linkage.components && chart.linkage.components.length) {
            chart.linkage.components.forEach((com) => { com.componentKey = randomStr + com.componentKey })
          }
          const newChart = {
            ...chart,
            offsetX: 0,
            group: randomStr,
            code: randomStr + chart.code
          }
          // 如果是从组件库中添加的自定义组件，则不需要初始化theme
          const isComponent = true
          this.$refs.Render.addChart(newChart, { x: chart.x, y: chart.y }, isComponent)
          this.updateRightVisiable(false)
        })
      })
    },
    // 添加远程组件
    setRemoteComponent (component) {
      const newChart = {
        ...component,
        offsetX: 0,
        offsetY: 0,
        code: randomString(8)
      }
      this.$refs.Render.addChart(newChart, { x: 0, y: 0 })
    },
    setImg (val) {
      this.$refs.Render.addSourceChart(
        JSON.stringify({
          title: val.originalName,
          name: val.originalName,
          icon: null,
          className:
              'com.gccloud.dataroom.core.module.chart.components.ScreenPictureChart',
          w: 300,
          h: 300,
          x: 0,
          y: 0,
          type: 'picture',
          option: {
            ...cloneDeep(settingConfig)
          },
          setting: {}, // 右侧面板自定义配置
          dataHandler: {}, // 数据自定义处理js脚本
          ...cloneDeep(dataConfig),
          customize: {
            url: val.url,
            radius: 0,
            opacity: 100
          }
        }),
        { x: 150, y: 100 }
      )
    },
    init () {
      this.changePageLoading(true)
      this.initLayout(this.pageCode)
        .then(() => {
          this.changePageLoading(false)
        })
        .finally(() => {
          setTimeout(() => {
            this.resetPresetLine()
          }, 500)
        })
    },
    // 点击当前组件时打开右侧面板
    openRightPanel (card) {
      this.rightVisiable = true
      this.pageInfoVisiable = false
      this.$refs.Rules.initRuleHeight()
    },
    openDataViewDialog (config) {
      this.$refs.dataViewDialog.init(config)
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
          this.changeLayout([])
          // 清空缓存的数据库的内容
          this.emptyDataset()
          this.emptyComputedDatas()
          this.resetPresetLine()
          this.saveTimeLine('清空画布')
        })
        .catch(() => {})
    },
    // 切换主题时针对远程组件触发样式修改的方法
    styleHandler (config) {
      this.$nextTick(() => {
        this.$refs.Render?.$refs['RenderCard' + config.code][0]?.$refs[
          config.code
        ]?.changeStyle(cloneDeep(config), true)
      })
    },
    // 自定义属性更新
    updateSetting (config) {
      if (config.type === 'map' || config.type === 'screenScrollBoard' || config.type === 'remoteComponent' || config.type === 'video' || config.type === 'flyMap') {
        config.key = new Date().getTime()
      }
      this.changeChartConfig(cloneDeep(config))
      // 如果是tab内的组件
      if (config.parentCode) {
        const dom = this.$refs.Render?.$refs['RenderCard' + config.parentCode][0]?.$refs[config.parentCode]?.$refs['RenderCard' + config.code]?.$refs[config.code]
        if (dom) {
          dom?.changeStyle(cloneDeep(config))
        }
      } else {
        if (this.$refs.Render?.$refs['RenderCard' + config.code]) {
          this.$refs.Render?.$refs['RenderCard' + config.code][0]?.$refs[
            config.code
          ]?.changeStyle(cloneDeep(config))
        }
      }
    },
    // 动态属性更新
    updateDataSetting (config) {
      config.key = new Date().getTime()
      this.changeChartConfig(config)
    },
    onSelectArea (area) {
      const { startX, startY, endX, endY } = area
      // 计算所有在此区域中的组件，如果在此区域中，将其code添加到activeCodes数组中
      const activeCodes = this.chartList
        ?.filter((chart) => {
          const { x, y, w, h } = chart
          return startX - 50 <= x && x + w <= endX && startY - 50 <= y && y + h <= endY
        })
        ?.map((chart) => chart.code)
      this.changeActiveCodes(activeCodes)
    },
    changeStart ({ x, y }) {
      this.ruleStartX = x
      this.ruleStartY = y
    },
    // 保存并预览
    saveAndPreview () {
      this.$refs.PageTopSetting.execRun()
    },
    // 保存
    save () {
      this.$refs.PageTopSetting.save('saveLoading')
    },
    changeScreenZoom (zoom) {
      // 自适应
      if (zoom === 'auto') {
        this.$refs.Rules.initZoom()
      } else {
        this.changeZoom(zoom)
      }
    },
    updateRightVisiable (visiable) {
      this.rightVisiable = visiable
      this.$refs.Rules.initRuleHeight()
    },
    toggleLeftSidebar () {
      this.$refs.Rules.initRuleHeight()
    },
    showPageInfo () {
      this.pageInfoVisiable = true
      this.rightVisiable = true
      this.changeActiveCode('')
    },
    // 页面信息更改
    updatePage () {
      this.$refs.Rules.initZoom()
    }
  }
}
</script>
<style lang="scss" scoped>
  .bs-page-design-wrap {
    overflow: hidden;

    .drag-wrap {
      display: flex;
      background-color: #1d1e20;
      height: calc(100vh - 40px);
      // overflow: hidden;

      .grid-wrap-box {
        flex: 1;
        // overflow: hidden;
        position: relative;
        margin: 8px 0 0 8px;

        .footer-tools-bar {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 30px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          z-index: 1000;
          background-color: var(--bs-background-2);

          .bs-select-wrap {
            margin-right: 16px;
          }

          .select-zoom-text {
            color: var(--bs-el-title);
            margin-right: 16px;
          }

          ::v-deep .el-select {
            width: 150px !important;
          }
        }
      }

      ::v-deep .el-loading-mask {
        background-color: transparent !important;
      }
    }
  }
.minimap{
  position: absolute ;
  bottom: 20px;
  right: 20px;
  z-index:1000;
}
.minimap .mapHeader{
  background-color:#303640;
  box-sizing:border-box;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  width: 150px;
  font-size: 12px;
  color: var(--bs-el-title);
  cursor: pointer;
  span {
    user-select: none;
  }
}

.minimap .selectWin{
  background-color: #232832;
  height: 150px;
  width: 150px;
  position: relative;
}

.minimap .selectionWin{
  position: absolute;
  left: 0px;
  top: 0px;
  width: 30px;
  height: 30px;
  background-color: white;
  opacity: 0.5;
  cursor: move;
}
</style>
