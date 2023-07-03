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
            <el-form-item label="按钮名称">
              <el-input
                v-model="config.title"
                class="bs-el-input"
                clearable
              />
            </el-form-item>
            <el-form-item label="字体颜色">
              <ColorPicker
                v-model="config.customize.fontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="字体大小">
              <el-input-number
                v-model="config.customize.fontSize"
                class="bs-el-input-number"
                controls-position="right"
                :min="12"
                :max="100"
              />
            </el-form-item>
            <el-form-item label="背景颜色">
              <div>
                <ColorPicker
                  v-model="config.customize.backgroundColor"
                  :predefine="predefineThemeColors"
                />
              </div>
            </el-form-item>
            <el-form-item label="图标选择">
              <IconPicker v-model="config.customize.icon.name" />
            </el-form-item>
            <el-form-item label="图标位置">
              <el-select
                v-model="config.customize.icon.position"
                popper-class="bs-el-select"
                class="bs-el-select"
              >
                <el-option
                  v-for="iconPosition in iconPositionOptions"
                  :key="iconPosition.value"
                  :label="iconPosition.label"
                  :value="iconPosition.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="边框颜色">
              <ColorPicker
                v-model="config.customize.borderStyle.borderColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                v-model="config.customize.borderStyle.borderWidth"
                class="bs-el-input-number"
                controls-position="right"
                :min="0"
                :max="10"
              />
            </el-form-item>
            <el-form-item label="边框样式">
              <el-select
                v-model="config.customize.borderStyle.borderStyle"
                popper-class="bs-el-select"
                class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="borderStyleItem in borderStyleOptions"
                  :key="borderStyleItem.value"
                  :label="borderStyleItem.label"
                  :value="borderStyleItem.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="边框圆角">
              <el-input-number
                v-model="config.customize.borderStyle.borderRadius"
                class="bs-el-input-number"
                controls-position="right"
                :min="0"
                :max="100"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import IconPicker from 'packages/IconPicker/index.vue'
import ColorPicker from 'packages/ColorPicker/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'Border14Setting',
  components: {
    IconPicker,
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
      typeOptions: [
        {
          label: '默认按钮',
          value: 'default'
        },
        {
          label: '主要按钮',
          value: 'primary'
        },
        {
          label: '文字按钮',
          value: 'text'
        },
        {
          label: '成功按钮',
          value: 'success'
        },
        {
          label: '信息按钮',
          value: 'info'
        },
        {
          label: '警告按钮',
          value: 'warning'
        },
        {
          label: '危险按钮',
          value: 'danger'
        }
      ],
      borderStyleOptions: [
        {
          label: '实线',
          value: 'solid'
        },
        {
          label: '虚线',
          value: 'dashed'
        },
        {
          label: '点线',
          value: 'dotted'
        }
      ],
      iconPositionOptions: [
        {
          label: '左',
          value: 'left'
        },
        {
          label: '右',
          value: 'right'
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
  width: 97%;
  padding: 16px;
  //padding-bottom: 70px;
}
</style>
