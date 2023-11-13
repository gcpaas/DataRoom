<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <div>
        <slot name="top" />
        <el-form
          :model="config.customize"
          label-position="left"
          class="setting-body bs-el-form"
          label-width="90px"
        >
          <SettingTitle>标题</SettingTitle>
          <div class="lc-field-body">
            <el-form-item label="标题">
              <el-input
                v-model="config.title"
                clearable
              />
            </el-form-item>
          </div>
          <SettingTitle>位置</SettingTitle>
          <div class="lc-field-body">
            <PosWhSetting :config="config" />
          </div>
         <SettingTitle>旋转</SettingTitle>
          <div class="lc-field-body">
            <RotateSetting
              :config="config"
            />
          </div>
          <SettingTitle v-if="config.border">边框</SettingTitle>
          <div class="lc-field-body">
            <BorderSetting
              v-if="config.border"
              label-width="100px"
              :bigTitle='config.title'
              :config="config.border"
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
            <el-form-item label="高度">
              <el-input-number
                v-model="config.customize.height"
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
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
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
    return {}
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
