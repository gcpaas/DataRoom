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
         <SettingTitle>旋转</SettingTitle>
          <div class="lc-field-body">
            <RotateSetting
              :config="config"
            />
          </div>
          <SettingTitle>基础</SettingTitle>
          <div class="lc-field-body">
            <el-form-item label="组件类型">
              <el-select
                v-model="config.customize.type"
                class="bs-el-select"
                popper-class="bs-el-select"
                @change="changeType"
              >
                <el-option
                  v-for="(type) in displayTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
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
            <!-- <el-form-item label="悬浮背景颜色">
              <ColorPicker
                v-model="config.customize.dropDownBox.hoverBgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item> -->
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
              v-if="['daterange', 'datetimerange'].includes(config.customize.type)"
              label="范围背景颜色"
            >
              <ColorPicker
                v-model="config.customize.dropDownBox.rangeBgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
          </div>
          <SettingTitle>日期时间格式</SettingTitle>
          <div class="lc-field-body">
            <!-- <el-form-item label="时间显示格式化">
              <div class="description">
                <el-input
                  v-model="config.customize.format"
                  placeholder="例如：yyyy-MM-dd HH:mm:ss"
                  clearable
                />
                <el-tooltip placement="top">
                  <span
                    class="el-icon-question"
                    style="color:#9e9e9e"
                  />
                  <div slot="content">
                    年：yyyy，表示年份，例如：2017<br>
                    月：M，表示月份，不补0，例如：1<br>
                    月：MM，表示月份，补0，例如：01<br>
                    日：d，表示日期，不补0，例如：2<br>
                    日：dd，表示日期，补0，例如：02<br>
                    小时：H，表示小时（24小时制），不补0，例如：3<br>
                    小时：HH，表示小时（24小时制），补0，例如：03<br>
                    小时：h，表示小时（12小时制），须和 A 或 a 使用，不补0，例如：3<br>
                    小时：hh，表示小时（12小时制），须和 A 或 a 使用，补0，例如：03<br>
                    分钟：m，表示分钟，不补0，例如：4<br>
                    分钟：mm，表示分钟，补0，例如：04<br>
                    秒：s，表示秒钟，不补0，例如：5<br>
                    秒：ss，表示秒钟，补0，例如：05<br>
                    AM/PM：A，仅 format 可用，大写，例如：AM<br>
                    am/pm：a，仅 format 可用，小写，例如：am<br>
                    JS时间戳：timestamp，仅 value-format 可用，组件绑定值为number类型，例如：1483326245000<br>
                    不需要格式化字符：[MM]，使用方括号标识不需要格式化的字符，例如：MM<br>
                    具体的时间格式化字符和使用方式，可以参考Element-UI官网的日期选择器的时间格式化部分。
                  </div>
                </el-tooltip>
              </div>
            </el-form-item> -->
            <el-form-item label="时间类型">
              <div class="description">
                <el-select
                  v-model="config.customize.formatType"
                  class="bs-el-select"
                  popper-class="bs-el-select"
                  clearable
                  @change="changeFormatType"
                >
                  <el-option
                    v-for="(type) in formatTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
                <el-tooltip placement="top">
                  <span
                    class="el-icon-question"
                    style="color:#9e9e9e"
                  />
                  <div slot="content">
                    时间戳：从1970年1月1日开始计算的秒数，数据类型为数值型，例如：1483326245000。<br>
                    自定义：通过输入特定的格式字符串来指定时间的数据格式，例如：yyyy-MM-dd HH:mm:ss对应数据为 2023-10-08 09:30:00。<br>
                  </div>
                </el-tooltip>
              </div>
            </el-form-item>
            <el-form-item
              v-if="config.customize.formatType === 'custom'"
              label="时间格式"
            >
              <!-- year/month/date/week/ datetime/datetimerange/daterange -->
              <div class="description">
                <el-input
                  v-model="config.customize.format"
                  placeholder="例如：yyyy-MM-dd HH:mm:ss"
                  clearable
                />
                <!-- HH表示小时（24小时制），mm表示分钟，ss表示秒 -->
                <el-tooltip placement="top">
                  <span
                    class="el-icon-question"
                    style="color:#9e9e9e"
                  />
                  <div slot="content">
                    <div slot="content">
                      年：yyyy，表示年份，例如：2017<br>
                      月：M，表示月份，不补0，例如：1<br>
                      月：MM，表示月份，补0，例如：01<br>
                      日：d，表示日期，不补0，例如：2<br>
                      日：dd，表示日期，补0，例如：02<br>
                      小时：H，表示小时（24小时制），不补0，例如：3<br>
                      小时：HH，表示小时（24小时制），补0，例如：03<br>
                      小时：h，表示小时（12小时制），须和 A 或 a 使用，不补0，例如：3<br>
                      小时：hh，表示小时（12小时制），须和 A 或 a 使用，补0，例如：03<br>
                      分钟：m，表示分钟，不补0，例如：4<br>
                      分钟：mm，表示分钟，补0，例如：04<br>
                      秒：s，表示秒钟，不补0，例如：5<br>
                      秒：ss，表示秒钟，补0，例如：05<br>
                      AM/PM：A，仅 format 可用，大写，例如：AM<br>
                      am/pm：a，仅 format 可用，小写，例如：am<br>
                      JS时间戳：timestamp，仅 value-format 可用，组件绑定值为number类型，例如：1483326245000<br>
                      不需要格式化字符：[MM]，使用方括号标识不需要格式化的字符，例如：MM<br>
                      具体的时间格式化字符和使用方式，可以参考Element-UI官网的日期选择器的时间格式化部分。
                    </div>
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
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'DateTimePickerSetting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
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
      hour: 'HH',
      minute: 'mm',
      second: 'ss',
      // 时间格式化类型选项
      formatTypeOptions: [
        { label: '时间戳', value: 'timestamp' },
        { label: '自定义格式', value: 'custom' }
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
  mounted () { },
  methods: {
    changeType (val) {
      if (val === 'year') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy'
        }
      } else if (val === 'month') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy-MM'
        }
      } else if (val === 'date') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy-MM-dd'
        }
      } else if (val === 'datetime') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy-MM-dd HH:mm:ss'
        }
      } else if (val === 'datetimerange') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy-MM-dd HH:mm:ss'
        }
      } else if (val === 'daterange') {
        if (this.config.customize.formatType === 'custom') {
          this.config.customize.format = 'yyyy-MM-dd'
        }
      }
    },
    changeFormatType (val) {
      if (val === 'timestamp') {
        this.config.customize.format = 'timestamp'
      } else if (val === 'custom') {
        this.config.customize.format = 'yyyy-MM-dd HH:mm:ss'
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

.description {
  display: flex;
  align-items: center;

  .el-tooltip {
    margin-left: 5px;
  }
}
</style>
