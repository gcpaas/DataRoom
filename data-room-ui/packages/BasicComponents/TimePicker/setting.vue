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
            <!-- 激活项文字颜色 -->
            <el-form-item label="选中项文字颜色">
              <ColorPicker
                v-model="config.customize.dropDownSelectedFontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
          </div>
          <SettingTitle>时间格式</SettingTitle>
          <div class="lc-field-body">
            <el-form-item label="时间格式化类型">
              <el-select
                v-model="config.customize.formatType"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
                @change="selectFormatType"
              >
                <el-option
                  v-for="(type) in formatTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="config.customize.formatType === 'custom'"
              label="自定义时间格式"
            >
              <div class="time-format-description">
                <el-input
                  v-model="config.customize.valueFormat"
                  placeholder="例如：HH:mm:ss"
                  clearable
                />
                <el-tooltip
                  content="时间格式示例：HH表示小时（24小时制），mm表示分钟，ss表示秒"
                  placement="top"
                >
                  <span
                    class="el-icon-question"
                    style="color:#9e9e9e"
                  />
                </el-tooltip>
              </div>
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
      hour: 'HH',
      minute: 'mm',
      second: 'ss',
      // 时间格式化类型选项
      formatTypeOptions: [
        { label: 'Date 对象', value: 'default' },
        { label: '时间戳', value: 'timestamp' },
        { label: '自定义', value: 'custom' }
      ]
    }
  },
  watch: {},
  mounted () {},
  methods: {
    selectFormatType (type) {
      if (type === 'default') {
        this.config.customize.value = ''
        this.config.customize.valueFormat = ''
      } else if (type === 'timestamp') {
        this.config.customize.value = 0
        this.config.customize.valueFormat = 'timestamp'
      } else if (type === 'custom') {
        this.config.customize.valueFormat = 'HH:mm:ss'
      }
    }
  }
}
</script>

  <style lang="scss" scoped>
  .lc-field-body {
    width: 97%;
    padding: 16px;
  }
  .time-format-description{
    display: flex;
    align-items: center;
    .el-tooltip{
      margin-left: 5px;
    }
  }
  </style>
