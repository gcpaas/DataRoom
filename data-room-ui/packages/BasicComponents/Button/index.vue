<template>
  <div class="basic-component-button">
    <el-button
      :type="config.customize.type"
      :round="config.customize.isRound"
      :plain="config.customize.isPlain"
      :loading="config.customize.isLoading"
      :style="{
        backgroundColor: config.customize.type ? null : config.customize.backgroundColor,
        borderColor: config.customize.borderStyle.borderColor,
        borderWidth: config.customize.borderStyle.borderWidth + 'px',
        borderStyle: config.customize.borderStyle.borderStyle,
        borderRadius: config.customize.borderStyle.borderRadius + 'px'
      }"
      :icon="config.customize.icon.position === 'left' ? config.customize.icon.name : ''"
      @click="handleClick"
    >
      <span :style="{ color: config.customize.fontColor, fontSize: config.customize.fontSize + 'px', }">
        {{ config.title }}
        <i
          v-if="config.customize.icon.position === 'right' && config.customize.icon.name"
          :class="config.customize.icon.name"
        />
      </span>
    </el-button>
  </div>
</template>

<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { mapState } from 'vuex'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'BasicComponentButton',
  mixins: [commonMixins, linkageMixins],
  computed: {
    ...mapState({
      chartList: state => state.bigScreen.pageInfo.chartList
    })
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    },
     predefineThemeColors: {
      type: Array,
      default: () => predefineColors
    }
  },
  mounted () {
    // this.chartInit()
  },
  methods: {
    handleClick () {
      const bindComponentData = {}
      this.chartList.forEach(chart => {
        this.config.dataSource.dimensionFieldList.forEach(code => {
          if (chart.code === code) {
            bindComponentData[chart.code] = chart.customize.value
          }
        })
      })
      this.linkage(bindComponentData)
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-component-button {
  width: 100%;
  height: 100%;

  .el-button {
    width: 100%;
    height: 100%;
  }
}
</style>
