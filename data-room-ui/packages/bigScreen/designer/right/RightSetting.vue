<template>
  <div
    class="dataroom-bigscreen-right-setting-wrap"
    @click.stop
  >
    <!--   页面设置 -->
    <ScreenSetPanel
      v-if="isScreenSet"
    />
    <!--   组件设置 -->
    <component
      :is="resolveComponentType(config.type) + 'Setting'"
      v-else-if="config.code"
      ref="customSetting"
      :key="config.code"
      :config="config"
    />
  </div>
</template>
<script>
import { resolveComponentType } from '@gcpaas/data-room-ui/packages/js/utils'
import panelList from '../../components/panelInstall'
const ScreenSetPanel = () => import('./ScreenSetPanel.vue')
export default {
  name: 'RightSetting',
  components: {
    ...panelList,
    ScreenSetPanel
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      activeName: 'data',
      isOperationRollback: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    isScreenSet () {
      return this.canvasInst.isScreenSet
    }
  },
  mounted () {
  },
  methods: {

    resolveComponentType

  }
}
</script>

<style lang="scss" scoped>
.dataroom-bigscreen-right-setting-wrap{
  width: 100%;
  height: 100%;
  ::v-deep .el-scrollbar__view{
    width: 100%;
    height: 100%;
  }
}
</style>
