<template>
  <div
    class="dataroom-dashboard-configuration-wrap"
    @click.stop="changeActive(config.code)"
    @contextmenu.stop="onContextmenu($event, config)"
  >
    <span
      v-show="!isPreview && config.locked"
      class="locked-status el-icon-lock"
    />
    <slot />
  </div>
</template>
<script>

import chartContextMenu from '@gcpaas/data-room-ui/packages/js/mixins/chartContextMenu'
export default {
  name: 'Configuration',
  mixins: [chartContextMenu],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isPreview () {
      return (this.$route.path === window?.SITE_CONFIG.dataRoom?.routers?.dashBoardPreviewUrl) || (this.$route.path === '/dash-bord/preview')
    }
  },
  data () {
    return {

    }
  },
  inject: ['canvasInst'],
  mounted () {},
  methods: {
    // 改变激活的组件
    changeActive (code) {
      // 设计态需要
      if (this.isPreview) return
      this.canvasInst.updateActiveChart(code)
      this.canvasInst.changeIsScreenSet(false)
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-dashboard-configuration-wrap {
  height: 100%;
  width: 100%;
  border: 1px solid transparent;
  //cursor: move;

  .opt-icon-wrap {
    z-index: 100;
    display: flex;
    position: absolute;
    right: 10px;
    top: 10px;
    &:hover{
      cursor: pointer;
    }
    .obt-item{
      padding: 0 5px;
    }
  }

  .point-text {
    position: absolute;
    top: -36px;
    left: -110px;
    background: #f2f2f2;
    border-radius: 6px;
    display: inline-block;
    width: 100px;
    text-align: center;
    padding: 2px;
    color: #8a7878;
    font-size: 18px;
  }

  .locked-status {
    position: absolute;
    right: 4px;
    top: 4px;
    background: rgba(0, 0, 0, 0.3);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
  }

  .hover {
    border: 1px dashed var(--bs-el-color-primary);
  }
  .active {
    border: -1px solid #c8ff00;
  }
}

</style>
