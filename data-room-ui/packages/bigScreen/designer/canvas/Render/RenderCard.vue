<!--
 * @description: 渲染组件
 * @Date: 2022-08-18 09:42:45
 * @Author: xingheng
-->

<template>
  <div
    class="dataroom-bigscreen-render-card"
    :data-code="config.code"
  >
    <component
      :is="resolveComponentType(config.border.type)"
      v-if="config.border&&config.border.type"
      :id="`border${config.code}`"
      :ref="`border${config.code}`"
      :key="`border${config.key}`"
      :config="config"
      :is-external-data="isExternalData"
      :external-data="externalData"
      :external-params="externalParams"
    >
      <slot />
    </component>
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
        :config="config"
        :is-external-data="isExternalData"
        :external-data="externalData"
        :external-params="externalParams"
      >
        <slot />
      </component>
    </div>
  </div>
</template>
<script>
import { resolveComponentType } from '@gcpaas/data-room-ui/packages/js/utils'
import componentList from '../../../components/componentInstall'
export default {
  name: 'RenderCard',
  components: {
    ...componentList
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    },
    isExternalData: {
      type: Boolean,
      default: false
    },
    externalData: {
      type: Array,
      default: () => ([])
    },
    externalParams: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      height: 0
    }
  },
  computed: {
  },
  created () {
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
    resolveComponentType
  }
}
</script>

<style lang="scss" scoped>
.dataroom-bigscreen-render-card{
  // position: relative;
  width: 100%;
  height: 100%;
  align-items: flex-end;

  .render-item-wrap {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 15px;
  }
}

</style>
