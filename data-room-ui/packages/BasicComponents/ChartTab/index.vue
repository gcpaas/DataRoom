<template>
  <div
    class="bs-design-wrap"
    :class="`bs-chart-tab-${customTheme}`"
  >
    <div
      v-if="config.customize.tabList.length"
      class="tab-title-box"
      :style="{'justify-content':config.customize.position}"
    >
      <div
        v-for="(tab,index) in config.customize.tabList"
        :key="index"
        class="tab-title-item"
        :class="{active:currentIndex === index}"
        :style="
          'font-size:' +
            config.customize.fontSize +
            'px;color:' +
            config.customize.color +
            ';font-weight:' +
            config.customize.fontWeight
        "
        @click="changeTab(index)"
      >
        {{ tab.name }}
      </div>
    </div>
    <div
      v-if="config.customize.tabList &&config.customize.tabList.length"
      class="line-box"
      :style="{'background-color':config.customize.lineColor}"
    />
    <div
      v-if="config.customize.tabList &&config.customize.tabList.length"
      class="chart-item-box"
    >
      <!--      <Configuration-->
      <!--        :config="config.customize.tabList[currentIndex].chart"-->
      <!--        @openRightPanel="openRightPanel"-->
      <!--      >-->
      <div
        v-if="config.customize.tabList[currentIndex].chartCode"
        class="configuration-wrap"
        :class="{
          'active': activeCodes.includes(config.customize.tabList[currentIndex].chartCode),
          'hover': hoverCode === config.customize.tabList[currentIndex].chartCode
        }"
        @mouseenter.stop="changeHover(config.customize.tabList[currentIndex].chartCode)"
        @mouseleave="changeHover('')"
        @click.stop="changeActive(config.customize.tabList[currentIndex].chartCode)"
      >
        <RenderCardInner
          :ref="'RenderCard' + config.customize.tabList[currentIndex].chartCode"
          :config="config.customize.tabList[currentIndex].chart"
          @click.native="currentChartHandler"
        />
      </div>
      <!--      </Configuration>-->
    </div>
    <el-empty
      v-else-if="!config.customize.tabList.length"
      description="请在右侧面板选择图表加入"
    />
  </div>
</template>

<script>
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
import { mapMutations, mapState } from 'vuex'
import RenderCardInner from 'data-room-ui/Render/RenderCard2.vue'
import Configuration from 'data-room-ui/Render/Configuration.vue'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
export default {
  name: 'ChartTab',
  components: { Configuration, RenderCardInner },
  mixins: [paramsMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState({
      pageCode: state => state.bigScreen.pageInfo.code,
      customTheme: state => state.bigScreen.pageInfo.pageConfig.customTheme,
      activeCode: state => state.bigScreen.activeCode,
      activeCodes: state => state.bigScreen.activeCodes,
      hoverCode: state => state.bigScreen.hoverCode,
      chartList: (state) => state.bigScreen.pageInfo.chartList
    })
  },
  data () {
    return {
      // currentChart: null
      currentIndex: 0
    }
  },
  mounted () {
  },
  // 销毁定时器
  destroyed () {
    if (this.timer) {
      clearInterval(this.timer) // 关闭
    }
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig',
      changeActiveCode: 'bigScreen/changeActiveCode',
      changeHoverCode: 'bigScreen/changeHoverCode'
    }),
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
    },
    // 切换tab页
    changeTab (index) {
      this.currentIndex = index
    },
    // 点击Tab中的某个组件
    currentChartHandler () {
      this.changeActiveCode(this.config.customize.tabList[this.currentIndex]?.chartCode)
      this.changeActiveItemConfig(this.config.customize.tabList[this.currentIndex]?.chart)
    },
    // 改变hover的组件
    changeHover (code) {
      this.changeHoverCode(code)
    },
    // 改变激活的组件
    changeActive (code) {
      this.changeActiveCode(code)
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap{
  width: 100%;
  .tab-title-box{
    height: 40px;
    display: flex;
    &:hover{
      cursor: pointer;
    }
    .tab-title-item{
      padding:10px;
    }
  }
  .chart-item-box{
    width: 100%;
    height: calc(100% - 40px);
    &:hover{
      cursor: pointer;
    }
    .configuration-wrap{
      width: 100%;
      height: calc(100% - 40px);
    }
  }
  .active{
    color: var(--bs-el-color-primary) !important;
  }
  .line-box{
    width: 98%;
    height: 1px;
    margin: 0 auto;
    //background-color: #d0d2d6;
  }
}
</style>
