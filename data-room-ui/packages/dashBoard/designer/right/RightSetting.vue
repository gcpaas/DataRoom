<template>
  <div
    class="dataroom-dashboard-right-setting-wrap"
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
      @closeRightPanel="close"
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
  data () {
    return {
      activeName: 'data',
      isOperationRollback: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    config () {
      return this.canvasInst.activeChart
    },
    pageCode () {
      return this.$route.query.code
    },
    isScreenSet () {
      return this.canvasInst.isScreenSet
    }
  },
  mounted () {
  },
  methods: {
    close () {
      this.$emit('closeRightPanel')
    },
    resolveComponentType

  }
}
</script>

<style lang="scss" scoped>
.dataroom-dashboard-right-setting-wrap{
  width: 100%;
  height: 100%;
  ::v-deep .el-scrollbar__view{
    width: 100%;
    height: 100%;
  }
}
</style>
