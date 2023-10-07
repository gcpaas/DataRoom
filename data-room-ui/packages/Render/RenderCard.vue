<!--
 * @description: 渲染组件
 * @Date: 2022-08-18 09:42:45
 * @Author: xingheng
-->

<template>
  <div class="content">
    <component
      :is="resolveComponentType(config.border.type)"
      v-if="config.border&&config.border.type"
      :id="`border${config.code}`"
      :ref="`border${config.code}`"
      :key="`border${config.key}`"
      :config="config"
    />
    <div
      class="render-item-wrap"
      :style="
        `height:calc(100% - ${(config.border&&config.title&&config.border.type&&config.border.type!='GcBorder11'&&config.border.isTitle)?config.border.titleHeight:0}px);
      padding-top:${config.border?config.border.padding[0]:0}px;
      padding-right:${config.border?config.border.padding[1]:0}px;
      padding-bottom:${config.border?config.border.padding[2]:0}px;
      padding-left:${config.border?config.border.padding[3]:0}px
      `"
    >
      <component
        :is="resolveComponentType(config.type)"
        :id="`${config.code}`"
        :ref="config.code"
        :key="config.key"
        :config="config"
        @styleHandler="styleHandler"
      />
    </div>
  </div>
</template>
<script>
// import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import { mapMutations } from 'vuex'
import { resolveComponentType } from 'data-room-ui/js/utils'
import pcComponent from 'data-room-ui/js/utils/componentImport'
import { dataInit, destroyedEvent } from 'data-room-ui/js/utils/eventBus'
import CustomComponent from '../PlotRender/index.vue'
import EchartsComponent from '../EchartsRender/index.vue'
import Svgs from '../Svgs/index.vue'
import RemoteComponent from 'data-room-ui/RemoteComponents/index.vue'
const components = {}
for (const key in pcComponent) {
  if (Object.hasOwnProperty.call(pcComponent, key)) {
    components[key] = pcComponent[key]
  }
}
export default {
  name: 'RenderCard',
  // mixins: [commonMixins],
  components: {
    ...components,
    CustomComponent,
    Svgs,
    RemoteComponent,
    EchartsComponent
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    },
    ruleKey: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      height: 0
    }
  },
  computed: {
  },
  mounted () {
    // 调用初始化方法
    dataInit(this)
  },
  beforeDestroy () {
    destroyedEvent()
  },
  methods: {
    ...mapMutations('bigScreen', [
      'changeChartConfig'
    ]),
    resolveComponentType,
    // 切换主题时针对远程组件触发样式修改的方法
    styleHandler (config) {
      this.$emit('styleHandler', config)
    }
    // // 打开右侧面板
    // openRightPanel () {
    //   this.$emit('openRightPanel', this.currentChart)
    // }
  }
}
</script>

<style lang="scss" scoped>
.content{
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}
.render-item-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: 15px;
}
</style>
