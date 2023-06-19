<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="100px"
      label-position="left"
      class="setting-body"
    >
      <el-form
        :model="config.customize"
        label-position="left"
        class="setting-body"
        label-width="100px"
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
          <slot name="top" />
          <el-form-item label="边框主颜色">
            <ColorPicker
              v-model="config.customize.borderMainColor"
              placeholder="请选择边框主颜色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="边框副颜色">
            <ColorPicker
              v-model="config.customize.borderSecondaryColor"
              placeholder="请选择边框副颜色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="背景色类型">
            <el-radio-group v-model="config.customize.colorType">
              <el-radio label="single">
                纯色
              </el-radio>
              <el-radio label="gradient">
                渐变色
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="config.customize.colorType === 'single'"
            label="背景色"
          >
            <ColorPicker
              v-model="config.customize.backgroundColor"
              placeholder="请选择背景色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            v-if="config.customize.colorType === 'gradient'"
            label="开始色值"
          >
            <ColorPicker
              v-model="config.customize.gradientColor0"
              placeholder="请选择渐变色开始色值"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            v-if="config.customize.colorType === 'gradient'"
            label="结束色值"
          >
            <ColorPicker
              v-model="config.customize.gradientColor1"
              placeholder="请选择渐变色结束色值"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            v-if="config.customize.colorType === 'gradient'"
            label="渐变色方向"
          >
            <el-select
              v-model="config.customize.gradientDirection"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="item in gradientDirection"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="不透明度">
            <el-input-number
              v-model="config.customize.opacity"
              class="bs-el-input-number"
              :min="0"
              :max="100"
              :step="10"
            />
          </el-form-item>
          <slot name="bottom" />
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
  name: 'BorderSetting',
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
      gradientDirection: [
        {
          label: '从左到右',
          value: 'to right'
        },
        {
          label: '从右到左',
          value: 'to left'
        },
        {
          label: '从上到下',
          value: 'to bottom'
        },
        {
          label: '从下到上',
          value: 'to top'
        },
        {
          label: '从左上到右下',
          value: 'to bottom right'
        },
        {
          label: '从右上到左下',
          value: 'to bottom left'
        },
        {
          label: '从左下到右上',
          value: 'to top right'
        },
        {
          label: '从右下到左上',
          value: 'to top left'
        }
      ]
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
.padding {
  padding: 10px 0;
}
</style>
