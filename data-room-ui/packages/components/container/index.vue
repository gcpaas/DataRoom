<template>
  <div class="dataroom-chart-container-wrapper">
    <div
      v-for="(chart,index) in config.children"
      :key="index"
      class="cube"
      style="width: 100%;height: 100%"
      :data-code="chart.code"
      :style="{
        width: chart.w + 'px',
        height: chart.h + 'px',
        transform: chart.transform,
      }"
    >
      <Configuration
        :config="chart"
      >
        <render-card
          :ref="'renderCard' + chart.code"
          :config="chart"
        />
      </Configuration>
    </div>
  </div>
</template>
<script>
import { resolveComponentType } from '@gcpaas/data-room-ui/packages/js/utils'
import componentList from '../../bigScreen/components/componentInstall'
import Configuration from '@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/Configuration.vue'
import RenderCard from '@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/RenderCard.vue'
const CanvasPanel = () => import(/* webpackChunkName: "CanvasPanel" */ '../../bigScreen/designer/canvas/Render/CanvasPanel.vue')
export default {
  name: 'Container',
  components: {
    RenderCard,
    Configuration,
    ...componentList,
    CanvasPanel
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      customClass: {}
    }
  },

  computed: {
  },
  mounted () {
  },
  methods: {
    resolveComponentType,
    initConfig () {

    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-chart-container-wrapper{
  width: 100%;
  height: 100%;
  // display: flex;
  // align-items: center;
  border: 1px solid #ccc;
  // position: relative;
  //justify-content: center;
  // .cube{
  //   position: absolute;
  // }
}
</style>
