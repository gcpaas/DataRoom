<!--
 * @description: 渲染组件
 * @Date: 2022-08-18 09:42:45
 * @Author: xingheng
-->

<template>
  <div class="render-item-wrap">
    <component
      v-if="config.border&&config.border.type"
      :is="resolveComponentType(config.border.type)"
      :id="`border${config.code}`"
      :ref="`border${config.code}`"
      :key="`border${config.key}`"
      :config="config"
    />
    <div class="element" v-if="config.border&&config.border.type" style="box-sizing:content-box;font-size:20px;color:#fff;margin:20px 0 0 20px">{{config.title}}</div>
       <component
        :is="resolveComponentType(config.type)"
        :id="`${config.code}`"
        :ref="config.code"
        :key="config.key"
        :config="config"
        @styleHandler="styleHandler"
      />
  </div>
</template>
<script>
// import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import { mapMutations } from 'vuex'
import { resolveComponentType } from 'data-room-ui/js/utils'
import pcComponent from 'data-room-ui/js/utils/componentImport'
import { dataInit, destroyedEvent } from 'data-room-ui/js/utils/eventBus'
import CustomComponent from '../PlotRender/index.vue'
import Svgs from '../Svgs/index.vue'
import RemoteComponent from 'data-room-ui/RemoteComponents/index.vue'
import cloneDeep from 'lodash/cloneDeep'
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
    RemoteComponent
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
    return {}
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
.render-item-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
