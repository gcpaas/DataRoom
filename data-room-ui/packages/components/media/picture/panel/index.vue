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
          <el-form
            ref="form"
            :model="config"
            label-width="100px"
            label-position="left"
            class="setting-body bs-el-form"
          >
            <div class="data-setting-box">
              <div
                class="data-setting-data-box"
              >
                <div class="lc-field-body">
<!--                  <el-form-item-->
<!--                    label="字体颜色"-->
<!--                    label-width="100px"-->
<!--                  >-->
<!--                    <el-color-picker-->
<!--                      v-model="config.color"-->
<!--                      @change="changeStyle(config)"-->
<!--                    />-->
<!--                  </el-form-item>-->
                </div>
              </div>
            </div>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="数据源"
        name="datasource"
      >
        <span slot="label"><i class="label-icon el-icon-menu" />数据源</span>
      </el-tab-pane>
      <el-tab-pane
        label="高级"
        name="advanced"
      >
        <span slot="label"><i class="label-icon el-icon-s-finance" />高级</span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
export default {
  name: '',
  mixins: [commonMixins],
  components: {
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
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
