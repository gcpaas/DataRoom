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
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import DataPanel from '@gcpaas/data-room-ui/packages/components/common/panel/dataPanel/index.vue'
import AdvancedPanel from '@gcpaas/data-room-ui/packages/components/common/panel/advancedPanel/index.vue'
import StylePanel from './stylePanel.vue'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: '',
  mixins: [commonMixins],
  components: {
    DataPanel,
    AdvancedPanel,
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
        dimensionField: '文本内容'
      },
      fieldsList: [],
      activeName: 'style'
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';

.bs-setting-wrap {
  height: 100%;
}
</style>
