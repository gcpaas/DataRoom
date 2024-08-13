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
        <StylePanel :config="config" />
      </el-tab-pane>
      <!--  数据配置 -->
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
import StylePanel from './stylePanel/index.vue'
import DataPanel from '@gcpaas/data-room-ui/packages/components/common/panel/dataPanel/index.vue'
import AdvancedPanel from '@gcpaas/data-room-ui/packages/components/common/panel/advancedPanel/index.vue'
export default {
  name: '',
  mixins: [commonMixins],
  components: {
    StylePanel,
    DataPanel,
    AdvancedPanel
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
        dimensionField: 'X轴字段',
        metricField: 'Y轴字段',
        classifiedField: '分组字段'
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
</style>
