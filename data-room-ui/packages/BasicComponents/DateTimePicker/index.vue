<template>
  <el-date-picker
    :key="config.customize.type"
    v-model="value"
    :picker-options="config.customize.pickerOptions"
    :type="config.customize.type"
    clearable
    :class="['basic-component-date-picker', `date-picker-${config.code}`]"
    :popper-class="'basic-component-date-picker date-picker-popper-' + config.code"
    :value-format="config.customize.format"
    :format="config.customize.format"
    :default-value="value"
    size="large"
    @focus="focusEvent"
    @change="changeValue"
    @mouseenter.native="mouseenter"
  />
</template>

<script>
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import { mapState } from 'vuex'
window.dataSetFields = []
export default {
  name: 'BasicComponentsDateTimePicker',
  components: {},
  mixins: [commonMixins, linkageMixins],
  props: {
    // 组件配置
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      value: '',
      innerConfig: {}
    }
  },
  computed: {
    ...mapState({
      chartList: state => state.bigScreen.pageInfo.chartList
    }),
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  watch: {
    'config.customize.formatType': {
      handler (val) {
        const newFomat = this.config.customize.format.replace(/y/g, 'Y').replace(/d/g, 'D')
        if (val === 'timestamp') {
          // this.value = 0
          if (['year', 'month', 'date', 'week', 'datetime'].includes(this.config.customize.type)) {
            this.value = moment(new Date()).format(newFomat)
          } else {
            this.value = [
              moment(new Date()).subtract(7, 'days').valueOf(),
              moment(new Date()).valueOf()
            ]
          }
        } else if (val === 'custom') {
          if (['year', 'month', 'date', 'week', 'datetime'].includes(this.config.customize.type)) {
            this.value = moment(new Date()).format(newFomat)
          } else {
            this.value = [
              moment(new Date()).subtract(7, 'days').format(newFomat),
              moment(new Date()).format(newFomat)
            ]
          }
        }
      },
      immediate: true
    },
    'config.customize.type': {
      handler (val) {
        this.$nextTick(() => {
          if (!this.isPreview) {
            document.querySelector(`.date-picker-${this.config.code}`).style.pointerEvents = 'none'
          }
        })
        const newFomat = this.config.customize.format.replace(/y/g, 'Y').replace(/d/g, 'D')
        if (['year', 'month', 'date', 'week', 'datetime'].includes(val)) {
          if (this.config.customize.formatType === 'timestamp') {
            this.value = moment(new Date()).valueOf()
          } else {
            this.value = moment(new Date()).format(newFomat)
          }
        } else {
          if (this.config.customize.formatType === 'timestamp') {
            this.value = [
              moment(new Date()).subtract(7, 'days').valueOf(),
              moment(new Date()).valueOf()
            ]
          } else {
            this.value = [
              moment(new Date()).subtract(7, 'days').format(newFomat),
              moment(new Date()).format(newFomat)
            ]
          }
        }
      },
      immediate: true
    },
    'config.customize.format': {
      handler (val) {
        this.$nextTick(() => {
          if (!this.isPreview) {
            document.querySelector(`.date-picker-${this.config.code}`).style.pointerEvents = 'none'
          }
        })
        const newFomat = val?.replace(/y/g, 'Y')?.replace(/d/g, 'D')
        if (['year', 'month', 'date', 'week', 'datetime'].includes(this.config.customize.type)) {
          this.value = moment(new Date()).format(newFomat)
          if (this.config.customize.formatType === 'timestamp') {
            this.value = moment(new Date()).valueOf()
          } else {
            this.value = moment(new Date()).format(newFomat)
          }
        } else {
          if (this.config.customize.formatType === 'timestamp') {
            this.value = [
              moment(new Date()).subtract(7, 'days').valueOf(),
              moment(new Date()).valueOf()
            ]
          } else {
            this.value = [
              moment(new Date()).subtract(7, 'days').format(newFomat),
              moment(new Date()).format(newFomat)
            ]
          }
        }
      }
    }
  },
  created () { },
  mounted () {
    if (!this.isPreview) {
      document.querySelector(`.date-picker-${this.config.code}`).style.pointerEvents = 'none'
    }
    this.changeStyle(this.config)
    if (this.value === '') {
      const newFomat = this.config.customize.format.replace(/y/g, 'Y').replace(/d/g, 'D')
      this.value = [
        moment(new Date()).subtract(7, 'days').format(newFomat),
        moment(new Date()).format(newFomat)
      ]
    }
  },
  beforeDestroy () {
  },
  methods: {
    dataFormatting (config, data) {
      config.option.data = []
      return config
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      this.innerConfig = config
      // 时间选择器元素
      const { bgColor, fontColor, fontSize } = config.customize
      this.$nextTick(() => {
        const timePickerEl = document.querySelector(`.date-picker-${config.code}`)
        timePickerEl.style.backgroundColor = bgColor
        // 时间选择器输入框元素
        const timePickerInput = timePickerEl.querySelector('.el-input__inner')
        if (timePickerInput) {
          // 时间选择器输入框背景颜色
          timePickerInput.style.backgroundColor = bgColor
          // 时间选择器输入框字体颜色
          timePickerInput.style.color = fontColor
          // 时间选择器输入框字体大小
          timePickerInput.style.fontSize = fontSize + 'px'
        }
        // 时间范围选择器输入框元素
        const timePickerRangeInput = timePickerEl.querySelectorAll('.el-range-input')
        if (timePickerRangeInput.length > 0) {
          // 连接符
          const timePickerRangeSeparator = timePickerEl.querySelector('.el-range-separator')
          if (timePickerRangeSeparator) {
            // 宽度和字体大小保持一致
            timePickerRangeSeparator.style.width = fontSize + 'px'
            timePickerRangeSeparator.style.color = fontColor
            timePickerRangeSeparator.style.fontSize = fontSize + 'px'
          }
          timePickerRangeInput.forEach((el) => {
            // 时间范围选择器输入框背景颜色
            el.style.backgroundColor = bgColor
            // 时间范围选择器输入框字体颜色
            el.style.color = fontColor
            // 时间范围选择器输入框字体大小
            el.style.fontSize = fontSize + 'px'
          })
        }
        // 时间选择器图标
        const timePickerIcon = timePickerEl.querySelector('.el-input__icon')
        if (timePickerIcon) {
          timePickerIcon.style.width = fontSize + 'px'
          timePickerIcon.style.fontSize = fontSize + 'px'
        }
      })
    },
    // 组件联动
    changeValue (val) {
      // 判断如果val是数组，需要将它转成字符串
      if (Array.isArray(val)) {
        val = val.join(',')
      }
      this.linkage({ [this.config.code]: val })
    },
    focusEvent () {
      this.$nextTick(() => {
        const { code } = this.innerConfig
        const { bgColor, fontColor, hoverFontColor, hoverBgColor, selectedFontColor, rangeBgColor, inputBgColor } = this.innerConfig.customize.dropDownBox
        const timePickerPopper = document.querySelector(`.date-picker-popper-${code}`)
        if (timePickerPopper) {
          // 去除边框
          timePickerPopper.style.border = 'none'
          // 确保下拉项的箭头颜色与下拉框的背景颜色保持一致
          timePickerPopper.style.color = bgColor
        }
        // 下拉项元素
        const pickerDropdownPanleContent = document.querySelector(`.date-picker-popper-${code}`)
        if (pickerDropdownPanleContent) {
          // 文字颜色
          pickerDropdownPanleContent.style.color = fontColor
          // 背景颜色
          pickerDropdownPanleContent.style.backgroundColor = bgColor
          // 下拉项添加var变量
          const dropdown = pickerDropdownPanleContent.style
          dropdown.setProperty('--fontColor', fontColor)
          dropdown.setProperty('--hoverFontColor', hoverFontColor)
          dropdown.setProperty('--bgColor', bgColor)
          dropdown.setProperty('--inputBgColor', inputBgColor)
          dropdown.setProperty('--selectedFontColor', selectedFontColor)
          dropdown.setProperty('--hoverBgColor', hoverBgColor)
          dropdown.setProperty('--rangeBgColor', rangeBgColor)
          // 选中项字体颜色
          const selectedEl = pickerDropdownPanleContent.querySelector('.selected')
          if (selectedEl) {
            selectedEl.style.color = selectedFontColor
          }
          // 选择过的，需要将选中颜色重置
          const pickerItemEl = document.querySelectorAll(`.date-picker-popper-${code} .el-time-spinner__item`)
          pickerItemEl.forEach((el) => {
            el.style.color = fontColor
          })
        }
      })
    },
    mouseenter () {
      if (this.value) {
        setTimeout(() => {
          // 清空图标
          const timePickerCloseIcon = document.querySelector(`.date-picker-${this.innerConfig.code} .el-icon-circle-close`)
          if (timePickerCloseIcon) {
            timePickerCloseIcon.style.fontSize = this.innerConfig.customize.fontSize + 'px'
          }
        }, 25)
      }
    }
  }

}
</script>

<style lang="scss">
.basic-component-date-picker {
  color: '';

  // 清空图标
  .el-icon-circle-close {
    display: flex;
    align-items: center;
  }

  // 时间选择器
  .el-icon-time {
    display: flex;
    align-items: center;
  }

  .el-time-panel {
    border: none;
    background-color: var(--bgColor);
  }

  // 选择日期 时间区域
  .el-date-picker__time-header {
    border-bottom: var(--bgColor);

    .el-input__inner {
      border: none;
      // 添加一点阴影
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
      color: var(--fontColor);
      background-color: var(--inputBgColor);
    }

  }

  // 头部，修改文字颜色和图标颜色
  .el-date-picker__header {
    color: var(--fontColor);

    .el-date-picker__header-label {
      color: var(--fontColor);
    }

    // 左右箭头图标颜色
    .el-picker-panel__icon-btn {
      color: var(--fontColor);
    }
  }

  // datetimerange
  .el-date-range-picker__time-header {
    border-color: var(--fontColor);

    // 中间箭头图标颜色
    .el-icon-arrow-right {
      color: var(--fontColor);
    }

    // 时间选择器输入框
    .el-input__inner {
      border: none;
      color: var(--fontColor);
      // 添加一点阴影
      background-color: var(--inputBgColor);
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
    }
  }

  // datetimerange
  .el-picker-panel__content {
    .el-icon-d-arrow-left {
      color: var(--fontColor);

      &:after {
        color: var(--fontColor);
      }
    }

    .el-icon-arrow-left {
      color: var(--fontColor);

      &:after {
        color: var(--fontColor);
      }
    }

    .el-icon-d-arrow-right {
      color: var(--fontColor);

      &:after {
        color: var(--fontColor);
      }
    }

    .el-icon-arrow-right {
      color: var(--fontColor);

      &:after {
        color: var(--fontColor);
      }
    }
  }

  .el-date-range-picker__content.is-left {
    border-color: var(--fontColor);
  }

  .el-date-table {
    th {
      border-color: var(--fontColor);
    }

    td {
      div {
        color: var(--fontColor);

        &:hover {
          color: var(--hoverFontColor);
        }
      }
    }
  }

  // 范围选择器背景颜色
  .in-range {
    div {
      // 下拉范围选中背景颜色
      background-color: var(--rangeBgColor) !important;
    }
  }

  .today {
    span {
      color: var(--selectedFontColor) !important;
    }
  }

  .el-time-panel__content::before {
    content: "";
    top: 50%;
    position: absolute;
    margin-top: -15px;
    height: 32px;
    z-index: 1;
    left: 0;
    right: 0;
    box-sizing: border-box;
    padding-top: 6px;
    text-align: left;
    border-top: 1px solid var(--fontColor);
    border-bottom: 1px solid var(--fontColor);
  }

  // 脚部
  .el-picker-panel__footer {
    border-color: var(--fontColor);
    background-color: var(--bgColor);

    // 清空按钮
    .el-picker-panel__link-btn {
      span {
        color: var(--fontColor);
      }
    }

    // 确定按钮
    .el-button--default {
      border: none;
      color: var(--fontColor);
      background-color: var(--bgColor);
    }

    .is-disabled {
      span {
        color: #999;
      }
    }
  }

  .el-time-spinner {
    margin-bottom: 0px;

    .el-time-spinner__item {
      &:hover {
        color: var(--hoverFontColor);
        background-color: var(--hoverBgColor);
      }
    }

    .active {
      color: var(--selectedFontColor);

      &:hover {
        color: var(--selectedFontColor);
        background-color: transparent;
      }
    }
  }

  .popper__arrow {
    bottom: -6px;
    border-bottom-color: var(--bgColor) !important;
    border-top-color: var(--bgColor) !important;

    &::after {
      bottom: 0px;
      border-bottom-color: var(--bgColor) !important;
      border-top-color: var(--bgColor) !important;
    }
  }

  .cancel {
    color: var(--fontColor);
  }

  .confirm {
    color: var(--selectedFontColor);
  }

  .el-time-panel__footer {
    border-top: 1px solid var(--fontColor);

    .cancel {
      span {
        color: var(--fontColor);
      }
    }

    // 确定按钮
    .confirm {
      border: none;
      color: var(--fontColor);
      background-color: var(--bgColor);
    }
  }

  // 年选择器
  .el-year-table {
    a {
      color: var(--fontColor);

      &:hover {
        color: var(--hoverFontColor);
      }
    }
  }

  // 月选择器
  .el-month-table {
    a {
      color: var(--fontColor);

      &:hover {
        color: var(--hoverFontColor);
      }
    }
  }

  // 上月 下月 字体颜色置灰
  .prev-month {
    span {
      color: #999 !important;

      &:hover {
        color: var(--hoverFontColor) !important;
      }
    }
  }

  .next-month {
    span {
      color: #999 !important;

      &:hover {
        color: var(--hoverFontColor) !important;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.basic-component-date-picker {
  width: 100% !important;
  height: 100% !important;

  // 范围时间选择器连接符
  ::v-deep .el-range-separator {
    display: flex !important;
    align-items: center !important;
  }

  .el-input--mini ::v-deep .el-input__inner {
    height: 100% !important;
    line-height: 100% !important;
  }

  .el-tag.el-tag--info {
    color: var(--bs-el-text) !important;
  }

}

::v-deep .el-input__inner {
  height: 100% !important;
  line-height: 100% !important;
}

::v-deep .el-range-input {
  width: 45% !important;
}</style>
