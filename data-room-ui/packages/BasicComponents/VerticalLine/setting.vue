<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body"
    >
      <slot name="top" />
      <el-form
        :model="config.customize"
        label-position="left"
        class="setting-body"
        label-width="90px"
      >
        <SettingTitle>标题</SettingTitle>
        <el-form-item label="边框名称" class="lc-field-body">
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
        <SettingTitle>位置</SettingTitle>
        <div class="lc-field-body">
          <PosWhSetting :config="config" />
        </div>
        <SettingTitle>基础</SettingTitle>
        <div class="lc-field-body">
          <el-form-item label="背景色一">
            <ColorPicker
              v-model="config.customize.gradientColor0"
              placeholder="请选择背景色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="背景色二">
            <ColorPicker
              v-model="config.customize.gradientColor1"
              placeholder="请选择背景色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number
              v-model="config.customize.width"
              class="bs-el-input-number"
              :min="0"
              :max="30"
              :step="1"
            />
          </el-form-item>
          <el-form-item
            label="不透明度"
            label-width="100px"
          >
            <el-slider
              v-model="config.customize.opacity"
              class="bs-slider bs-el-input-number"
              :min="0"
              :max="100"
              show-input
            />
          </el-form-item>
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import ColorPicker from 'packages/ColorPicker/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'Border14Setting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle
  },
  props: {
    config: {
      type: Object,
      required: true
    },
    predefineThemeColors: {
      type: Array,
      default: () => {
        return [
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
    }
  },
  data () {
    return {

    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.lc-field-body {
  padding: 12px 16px;
}
</style>
