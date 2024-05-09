<template>
  <div class="dataroom-panel-wrapper">
    <el-tabs
      v-model="activeName"
      class="setting-tabs"
    >
      <!--  样式配置 -->
      <el-tab-pane
        name="style"
      >
        <span slot="label"><i class="label-icon el-icon-help" />样式</span>
        <div
          class="bs-setting-wrap"
          @click.stop
        >
          <StylePanel :config="config" />
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="数据源"
        name="datasource"
      >
        <span slot="label"><i class="label-icon el-icon-menu" />数据源</span>
        <DataPanel
          :config="config"
          :field-name-mapping="fieldNameMapping"
        />
      </el-tab-pane>
      <el-tab-pane
        label="高级"
        name="advanced"
      >
        <span slot="label"><i class="label-icon el-icon-s-finance" />高级</span>
        <AdvancedPanel
          :config="config"
          :field-name-mapping="fieldNameMapping"
        ></AdvancedPanel>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import StylePanel from './StylePanel.vue'
import cloneDeep from 'lodash/cloneDeep'
import AdvancedPanel from "@gcpaas/data-room-ui/packages/components/common/panel/advancedPanel/index.vue"
import DataPanel from '@gcpaas/data-room-ui/packages/components/common/panel/dataPanel/index.vue'

export default {
  name: '',
  mixins: [commonMixins],
  components: {
    AdvancedPanel,
    DataPanel,
    StylePanel
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      fieldNameMapping: {
        dimensionField: '图片地址',
        metricField: '链接地址'
      },
      fieldsList: [],
      activeName: 'style'
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {

  }
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
.bs-setting-wrap{
  height: 100%;
}
</style>
