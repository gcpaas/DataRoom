<template>
  <div>
    <el-form
      ref="form"
      :model="config"
      :rules="customRules"
      label-width="120px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="名称"
        >
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
      </div>
      <SettingTitle v-if="config.border">
        边框
      </SettingTitle>
      <div class="lc-field-body">
        <BorderSetting
          v-if="config.border"
          label-width="120px"
          :config="config.border"
          :big-title="config.title"
        />
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting
          :config="config"
          label-width="120px"
        />
      </div>
      <SettingTitle>旋转</SettingTitle>
      <div class="lc-field-body">
        <RotateSetting
          :config="config"
        />
      </div>
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item label="表头颜色">
          <ColorPicker
            v-model="config.customize.headerBackgroundColor"
            placeholder="请选择表头颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="表头字体颜色">
          <ColorPicker
            v-model="config.customize.headerFontColor"
            style="width:180px"
            placeholder="请选择表头字体颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="表头字体大小">
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
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import { chartSettingMixins } from 'data-room-ui/js/mixins/chartSettingMixins'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import { predefineColors } from 'data-room-ui/js/utils/colorList'
export default {
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  mixins: [chartSettingMixins],
  data () {
    return {
      predefineThemeColors: predefineColors
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
  methods: {
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/settingWrap.scss";
.lc-field-body {
  padding: 12px 16px;
}
</style>
