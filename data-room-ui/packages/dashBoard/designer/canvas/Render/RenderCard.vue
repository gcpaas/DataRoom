<!--
 * @description: 渲染组件
 * @Date: 2022-08-18 09:42:45
 * @Author: xingheng
-->

<template>
  <div class="dataroom-dashboard-render-card">
    <header class="top-title">
      <span>{{ config.title.text }}</span>
    </header>
    <div class="render-item-wrap-inner">
      <component
        :is="resolveComponentType(config.border.type)"
        v-if="config.border&&config.border.type"
        :id="`border${config.code}`"
        :ref="`border${config.code}`"
        :key="`border${config.key}`"
        :config="config"
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
          :key="config.key"
          :config="config"
          @styleHandler="styleHandler"
        >
          <slot />
        </component>
      </div>
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
    ruleKey: {
      type: Number,
      default: 0
    },
    cutDataset: {
      type: Boolean,
      default: false
    },
    pageIndex: {
      type: Number,
      default: 0
    },
    pageNumber: {
      type: Number,
      default: 1
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
    resolveComponentType,
    // 切换主题时针对远程组件触发样式修改的方法
    styleHandler (config) {
      this.$emit('styleHandler', config)
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-dashboard-render-card{
  position: relative;
  width: 100%;
  height: 100%;
  //display: flex;
  //align-items: flex-end;
  .top-title {
    color: #76838f;
    padding: 8px 8px 8px 0;
    line-height: 20px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 14px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    span {
      display: inline-block;
      border-left: 3px solid #409EFF;
      padding-left: 16px;
    }
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
  .render-item-wrap-inner {
    height: calc(100% - 40px);
    position: relative;
  }
}

</style>
