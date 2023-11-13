<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <slot name="top" />
      <el-form
        :model="config.customize"
        label-position="left"
        class="setting-body bs-el-form"
        label-width="90px"
      >
        <SettingTitle>标题</SettingTitle>
        <el-form-item
          label="标题"
          class="lc-field-body"
        >
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
        <SettingTitle>位置</SettingTitle>
        <div class="lc-field-body">
          <PosWhSetting :config="config" />
        </div>
         <SettingTitle v-if="config.border">边框</SettingTitle>
          <div class="lc-field-body">
            <BorderSetting
              v-if="config.border"
              label-width="100px"
              :config="config.border"
              :bigTitle='config.title'
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
            <el-input-number
              v-model="config.customize.opacity"
              class="bs-el-input-number"
              placeholder="请输入不透明度"
              :min="0.01"
              :max="1"
              :precision="2"
              :step="0.01"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'Border14Setting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  props: {
    config: {
      type: Object,
      required: true
    },
     predefineThemeColors: {
      type: Array,
      default: () => predefineColors
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
