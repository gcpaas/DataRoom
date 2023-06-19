<!--
 * @description: 图层列表
 * @Author: xing.heng
 * @Date: 2023/3/16 11:32
-->
<template>
  <div class="layer-list-wrap">
    <draggable
      v-model="chartList"
      :options="{ group: 'chart' }"
      @change="change"
    >
      <div
        v-for="(chart) in chartList"
        :key="chart.code"
        :class="{
          'layer-list-item': true,
          'layer-list-item-hover': chart.code === hoverCode,
          'layer-list-item-active': chart.code === activeCode
        }"
        @mouseenter.stop="changeHoverCode(chart.code)"
        @click.stop="changeActiveCode(chart.code)"
        @contextmenu="onContextmenu($event, chart)"
      >
        <div class="layer-list-item-icon el-icon-rank" />
        <div
          class="layer-list-item-name"
          :title="chart.title"
        >
          {{ chart.title }}
        </div>
      </div>
    </draggable>
    <el-empty
      v-if="!chartList.length"
      :image-size="90"
      description="未拖拽任何组件"
    />
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import draggable from 'vuedraggable'

import chartContextMenu from 'packages/js/mixins/chartContextMenu'
export default {
  name: 'LayerList',
  components: {
    draggable
  },
  mixins: [chartContextMenu],
  props: {},
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      chartList: state => state.bigScreen.pageInfo.chartList,
      activeCode: state => state.bigScreen.activeCode,
      activeItemConfig: state => state.bigScreen.activeItemConfig
    }),
    chartList: {
      get () {
        return this.$store.state.bigScreen.pageInfo.chartList
      },
      set (val) {
        this.changeLayout(val)
      }
    }
  },
  mounted () {},
  methods: {
    ...mapMutations({
      changeLayout: 'bigScreen/changeLayout',
      changeZIndex: 'bigScreen/changeZIndex',
      changeHoverCode: 'bigScreen/changeHoverCode',
      changeActiveCode: 'bigScreen/changeActiveCode'
    }),
    change (e) {
      this.changeZIndex(this.chartList)
    },
    changeActive (code) {
      this.changeActiveCode(code)
      this.$emit('openRightPanel')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/BigScreenDesign/fonts/iconfont.css';
.layer-list-wrap {
  width: 100%;
  height: 100%;
  overflow: auto;

  .layer-list-item {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    cursor: move;

    &-icon {
      width: 20px;
      height: 20px;
      margin-right: 16px;
      display: flex;
      align-items: center;
    }

    &-name {
      font-size: 14px;
      color: #fff;
      // 超出省略
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-hover {
      background-color: #007aff80;
    }
    &-active {
      background-color: #007aff;
    }
  }
}
</style>
