<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="100px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <div>
        <slot name="top" />
        <el-form
          :model="config.customize"
          label-position="left"
          class="setting-body bs-el-form"
          label-width="100px"
        >
          <SettingTitle>位置</SettingTitle>
          <div class="lc-field-body">
            <PosWhSetting :config="config" />
          </div>
          <SettingTitle>基础</SettingTitle>
          <div class="lc-field-body">
            <!-- 选择器背景颜色 -->
            <el-form-item label="背景颜色">
              <ColorPicker
                v-model="config.customize.backgroundColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 字体大小 -->
            <el-form-item label="字体大小">
              <el-input-number
                v-model="config.customize.fontSize"
                class="bs-el-input-number"
                :min="12"
                :max="100"
              />
            </el-form-item>
            <!-- 字体颜色 -->
            <el-form-item label="字体颜色">
              <ColorPicker
                v-model="config.customize.fontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 下拉框是否需要边框 -->
            <!-- <el-form-item label="下拉框边框">
              <el-switch v-model="config.customize.dropDownBorder" />
            </el-form-item> -->
            <!-- 下拉框如果有边框，再选择边框颜色 -->
            <!-- <el-form-item
              v-if="config.customize.dropDownBorder"
              label="下拉框边框颜色"
            >
              <ColorPicker
                v-model="config.customize.dropDownBorderColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item> -->
            <!-- hover 颜色 -->
            <!-- 下拉框字体大小 -->
            <!-- <el-form-item label="下拉框字体大小">
              <el-input-number
                v-model="config.customize.dropDownFontSize"
                class="bs-el-input-number"
                :min="12"
                :max="100"
              />
            </el-form-item> -->
            <!-- 下拉框字体颜色 -->
          </div>
          <SettingTitle>下拉项</SettingTitle>
          <!-- 选择器下拉框背景颜色 -->
          <div class="lc-field-body">
            <el-form-item label="背景颜色">
              <ColorPicker
                v-model="config.customize.dropDownBackgroundColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="字体颜色">
              <ColorPicker
                v-model="config.customize.dropDownFontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 下拉项悬浮背景颜色 -->
            <el-form-item label="悬浮颜色">
              <ColorPicker
                v-model="config.customize.dropDownHoverBackgroundColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 下拉项悬浮字体颜色 -->
            <el-form-item label="悬浮字体颜色">
              <ColorPicker
                v-model="config.customize.dropDownHoverFontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 激活项背景颜色 -->
            <el-form-item label="激活项背景颜色">
              <ColorPicker
                v-model="config.customize.activeBackgroundColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 激活项文字颜色 -->
            <el-form-item label="激活项文字颜色">
              <ColorPicker
                v-model="config.customize.activeFontColor"
                :predefine="predefineThemeColors"
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
// import IconPicker from 'data-room-ui/IconPicker/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'Border14Setting',
  components: {
    // IconPicker,
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
    width: 97%;
    padding: 16px;
  }
  </style>
