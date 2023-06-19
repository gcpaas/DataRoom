<template>
  <div
    class="configuration-wrap"
    :class="{
      'active': activeCodes.includes(config.code),
      'hover': hoverCode === config.code
    }"
    @mouseenter.stop="changeHover(config.code)"
    @mouseleave="changeHover('')"
    @click.stop="changeActive(config)"
    @contextmenu="onContextmenu($event, config)"
  >
    <!--    <span class="point-text" v-show="hoverCode === config.code"> {{ getPoint(config) }}</span>-->
    <span
      v-show="config.locked"
      class="locked-status el-icon-lock"
    />
    <slot />
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'

import chartContextMenu from 'packages/js/mixins/chartContextMenu'
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
    ...mapState({
      activeCode: state => state.bigScreen.activeCode,
      activeCodes: state => state.bigScreen.activeCodes,
      hoverCode: state => state.bigScreen.hoverCode,
      activeItemConfig: state => state.bigScreen.activeItemConfig,
      chartList: state => state.bigScreen.pageInfo.chartList,
      presetLine: state => state.bigScreen.presetLine
    })
  },
  data () {
    return {

    }
  },
  mounted () {},
  methods: {
    ...mapMutations('bigScreen', [
      'changeHoverCode',
      'changeActiveCode',
      'changeChartConfig',
      'addItem',
      'delItem',
      'resetPresetLine',
      'changeLayout',
      'changeZIndex',
      'changeLocked'
    ]),
    // 改变hover的组件
    changeHover (code) {
      this.changeHoverCode(code)
    },
    // 改变激活的组件
    changeActive (config) {
      this.changeActiveCode(config.code)
    }
  }
}
</script>

<style lang="scss" scoped>
.configuration-wrap {
  height: 100%;
  width: 100%;
  border: 1px solid transparent;
  cursor: move;

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
}

.hover {
  border: 1px dashed var(--bs-el-color-primary);
}
.active {
  border: 1px solid var(--bs-el-color-primary);
}
</style>
