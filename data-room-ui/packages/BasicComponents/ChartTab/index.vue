<template>
  <div
    class="bs-design-wrap"
    :class="`bs-chart-tab-${customTheme}`"
  >
    <div
      v-if="config.customize.tabList.length"
      class="tab-title-box"
    >
      <div
        v-for="(tab,index) in config.customize.tabList"
        :key="index"
        class="tab-title-item"
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
      class="chart-item-box"
    >
      <Configuration
        :config="config.customize.tabList[currentIndex].chart"
        @openRightPanel="openRightPanel"
      >
        <RenderCardInner
          :ref="'RenderCard' + config.customize.tabList[currentIndex].chartCode"
          :config="config.customize.tabList[currentIndex].chart"
          @click.native="currentChartHandler"
        />
      </Configuration>
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
// import RenderCardInner from 'data-room-ui/Render/RenderCard2.vue'
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
      chartList: (state) => state.bigScreen.pageInfo.chartList
    })
    // currentChart () {
    //   if (this.config.customize.tabList && this.config.customize.tabList.length) {
    //     return { ...this.config.customize.tabList[this.currentIndex].chart, key: new Date().getTime() }
    //   } else {
    //     return null
    //   }
    // }
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
      changeActiveCode: 'bigScreen/changeActiveCode'
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
      // this.currentChart = this.config.customize.tabList[index]?.chart
      // this.changeActiveItemConfig(this.currentChart)
      // this.currentChart.key = new Date().getTime()
    },
    // 点击Tab中的某个组件
    currentChartHandler () {
      this.changeActiveCode(this.config.customize.tabList[this.currentIndex]?.chartCode)
      this.changeActiveItemConfig(this.config.customize.tabList[this.currentIndex]?.chart)
      console.log()
    },
    // 打开右侧面板
    openRightPanel () {
      // EventBus.$emit('openRightPanel', this.currentChart)
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
    border-bottom: 1px solid  var(--bs-el-background-2);
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
  }
}
</style>
