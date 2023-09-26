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
                v-model="config.customize.bgColor"
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
                v-model="config.customize.dropDownBox.bgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="字体颜色">
              <ColorPicker
                v-model="config.customize.dropDownBox.fontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 下拉项悬浮背景颜色 -->
            <el-form-item label="悬浮颜色">
              <ColorPicker
                v-model="config.customize.dropDownBox.hoverBgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 下拉项悬浮字体颜色 -->
            <el-form-item label="悬浮字体颜色">
              <ColorPicker
                v-model="config.customize.dropDownBox.hoverFontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 激活项文字颜色 -->
            <el-form-item label="选中项文字颜色">
              <ColorPicker
                v-model="config.customize.dropDownBox.selectedFontColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <!-- 选中范围背景颜色 -->
            <el-form-item
              v-if="['daterange','datetimerange'].includes(config.customize.type)"
              label="范围背景颜色"
            >
              <ColorPicker
                v-model="config.customize.dropDownBox.rangeBgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
          </div>
          <SettingTitle>时间格式</SettingTitle>
          <div class="lc-field-body">
            <el-form-item label="显示类型">
              <el-select
                v-model="config.customize.type"
                class="bs-el-select"
                popper-class="bs-el-select"
              >
                <el-option
                  v-for="(type) in displayTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间格式化类型">
              <el-select
                v-model="config.customize.formatType"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
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
              <!-- year/month/date/week/ datetime/datetimerange/daterange -->
              <div class="time-format-description">
                <el-input
                  v-model="config.customize.valueFormat"
                  placeholder="例如：yyyy-MM-dd HH:mm:ss"
                  clearable
                />
                <!-- HH表示小时（24小时制），mm表示分钟，ss表示秒 -->
                <el-tooltip
                  placement="top"
                >
                  <span
                    class="el-icon-question"
                    style="color:#9e9e9e"
                  />
                  <div slot="content">
                    时间格式示例：<br>
                    yyyy：表示年份，<br>
                    MM：表示月份，<br>
                    dd：表示日期，<br>
                    HH：表示小时（24小时制），<br>
                    mm：表示分钟，<br>
                    ss：表示秒，<br>
                    具体可参考Element-UI官网的日期选择器的时间格式化部分。
                  </div>
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
import moment from 'moment'
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
        { label: '时间戳', value: 'timestamp' },
        { label: '自定义', value: 'custom' }
      ],
      // 时间显示类型选项 :year/month/date/week/ datetime/datetimerange/daterange
      displayTypeOptions: [
        { label: '年', value: 'year' },
        { label: '月', value: 'month' },
        { label: '日', value: 'date' },
        { label: '日期时间', value: 'datetime' },
        { label: '日期时间范围', value: 'datetimerange' },
        { label: '日期范围', value: 'daterange' }
      ]
    }
  },
  watch: {},
  mounted () {},
  methods: { }
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
