<template>
  <div>
    <el-form
      ref="form"
      :model="config"
      :rules="customRules"
      label-width="120px"
      label-position="left"
      class="setting-body"
    >
      <SettingTitle>基础</SettingTitle>
      <el-form-item class="lc-field-body" label="名称">
        <el-input
          v-model="config.title"
          clearable
        />
      </el-form-item>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting
          :config="config"
          label-width="120px"
        />
      </div>
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item label="头部背景颜色">
          <ColorPicker
            v-model="config.customize.headerBackgroundColor"
            placeholder="请选择头部背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="头部字体颜色">
          <ColorPicker
            v-model="config.customize.headerFontColor"
            style="width:180px"
            placeholder="请选择头部字体颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="头部字体大小">
          <el-input-number
            v-model="config.customize.headerFontSize"
            class="bs-el-input-number"
            :min="12"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="主体背景颜色">
          <ColorPicker
            v-model="config.customize.bodyBackgroundColor"
            placeholder="请选择主体背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="主体字体颜色">
          <ColorPicker
            v-model="config.customize.bodyFontColor"
            placeholder="请选择主体字体颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="主体字体大小">
          <el-input-number
            v-model="config.customize.bodyFontSize"
            class="bs-el-input-number"
            :min="12"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="奇数行背景颜色">
          <ColorPicker
            v-model="config.customize.evenRowBackgroundColor"
            placeholder="请选择奇数行背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="偶数行背景颜色">
          <ColorPicker
            v-model="config.customize.oddRowBackgroundColor"
            placeholder="请选择偶数行背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
      </div>

    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import ColorPicker from 'packages/ColorPicker/index.vue'
import { chartSettingMixins } from 'packages/js/mixins/chartSettingMixins'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle
  },
  mixins: [chartSettingMixins],
  data () {
    return {
      predefineThemeColors: [
        '#007aff',
        '#1aa97b',
        '#ff4d53',
        '#1890FF',
        '#DF0E1B',
        '#0086CC',
        '#2B74CF',
        '#00BC9D',
        '#ED7D32'
      ]
    }
  },
  computed: {
    config: {
      get () {
        return this.$store.state.bigScreen.activeItemConfig
      },
      set (val) {
        this.$store.state.bigScreen.activeItemConfig = val
      }
    },
    pageCode () {
      return this.$route.query.code
    }
  },
  watch: {},
  mounted () { },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import "../~packages/assets/style/settingWrap.scss";
.lc-field-body {
  padding: 12px 16px;
}
</style>
