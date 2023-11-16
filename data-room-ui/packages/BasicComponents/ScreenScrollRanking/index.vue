<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
    <dv-scroll-ranking-board
      :key="updateKey"
      class="ranking-box"
      :class="{'light-theme':customTheme === 'light','auto-theme':customTheme =='dark'}"
      :config="option"
      :style="{
        '--rank-font-size':customize.rankFontSize + 'px',
        '--rank-color':customize.rankColor,
        '--info-name-font-size':customize.infoNameFontSize + 'px',
        '--info-name-color':customize.infoNameColor,
        '--ranking-value-font-size':customize.rankingValueFontSize + 'px',
        '--ranking-value-color':customize.rankingValueColor,
        '--inside-column-color':customize.insideColumnColor,
        '--ranking-column-border-bottom-color':customize.rankingColumnBorderBottomColor
      }"
      @click="rowClick"
    />
  </div>
</template>
<script>
import DvScrollRankingBoard from '@jiaminghi/data-view/lib/components/scrollRankingBoard/src/main.vue'
import '@jiaminghi/data-view/lib/components/scrollRankingBoard/src/main.css'
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
export default {
  name: 'ScrollRankingBoard',
  components: {
    DvScrollRankingBoard
  },
  mixins: [refreshComponentMixin, paramsMixins, commonMixins, linkageMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      updateKey: 0
    }
  },
  computed: {
    option: {
      get () {
        return { ...this.config.customize, data: this.config.option.data }
      },
      set (value) {}
    },
    customize(){
      return this.config.customize
    }
  },
  watch: {
  },
  mounted () {
  },
  methods: {
    // 点击事件
    rowClick (row) {
      this.linkage(row)
    },
    dataFormatting (config, data) {
      const dataSourseList = []
      data.data.forEach(item => {
        dataSourseList.push({ name: item[config.dataSource.dimensionField || 'name'], value: item[config.dataSource.metricField || 'sum(num)'] })
      })
      config.option = {
        ...config.option,
        data: dataSourseList
      }
      return config
    }

  }
}
</script>

<style lang="scss" scoped>
.light-theme{
  background-color: #ffffff;
  color: #000000;
}
.auto-theme{
  background-color: rgba(0,0,0,0);
}
.dark-theme{
  background-color:rgb(31, 31, 31) ;
}
  .bs-design-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border-radius: 4px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
  .title-box{
    height: 40px;
    padding: 10px 10px 0 0;
    box-sizing: border-box;
    .title {
      font-size: 14px;
      color: #333;
      font-weight: bold;
      border-left: 3px solid var(--bs-el-color-primary);
      padding-left: 16px;
    }
    .target-value{
      overflow-y: auto;
      height: 60px;
      font-weight: bold;
      width: 100%;
      font-size: 20px;
      color: #333;
      padding: 16px 0 0 22px;
      box-sizing: border-box;
    }
  }
  .el-icon-warning{
    color: #FFD600;
  }
  .title-hover{
    &:hover{
      cursor: move;
    }
  }
  .ranking-box{
    padding: 10px;
  }
  /*滚动条样式*/
  ::v-deep ::-webkit-scrollbar {
    width: 4px;
    border-radius: 4px;
    height: 4px;
  }
  ::v-deep ::-webkit-scrollbar-thumb {
    background: #dddddd !important;
    border-radius: 10px;
  }
::v-deep .dv-scroll-ranking-board{
  .ranking-info{
    .rank{
      font-size: var(--rank-font-size);
      color: var(--rank-color);
    }
    .info-name{
      font-size: var(--info-name-font-size);
      color: var(--info-name-color);
    }
    .ranking-value{
      font-size: var(--ranking-value-font-size);
      color: var(--ranking-value-color);
    }
  }
  .ranking-column{
    border-bottom: 2px solid var(--ranking-column-border-bottom-color);
    .inside-column{
      background-color: var(--inside-column-color);
    }
  }
}
</style>
