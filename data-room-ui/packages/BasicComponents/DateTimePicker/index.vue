<template>
  <el-date-picker
    v-model="config.customize.value"
    :picker-options="config.customize.pickerOptions"
    type="datetimerange"
    clearable
    :class="['basic-component-date-picker', `date-picker-${config.code}`]"
    :popper-class="'basic-component-date-picker date-picker-popper-' + config.code"
    :value-format="config.customize.valueFormat"
    @focus="focusEvent"
    @change="changeValue"
    @mouseenter.native="mouseenter"
  />
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import { mapState } from 'vuex'
window.dataSetFields = []
export default {
  name: 'BasicComponentSelect',
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
    // placeholder () {

    // },
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  watch: {
    config: {
      handler: function (val) {
        if (val && val.customize && val.customize.formatType === 'custom') {
          this.$nextTick(() => {
            this.value = toString(this.value)
          })
        }
      },
      deep: true
    }
  },
  created () { },
  mounted () {
    // if (!this.isPreview) {
    //   document.querySelector(`.date-picker-${this.config.code}`).style.pointerEvents = 'none'
    // }
    this.changeStyle(this.config)
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
      const timePickerEl = document.querySelector(`.date-picker-${config.code}`)
      timePickerEl.style.backgroundColor = config.customize.backgroundColor
      // 时间选择器输入框元素
      const timePickerInput = timePickerEl.querySelector('.el-input__inner')
      if (timePickerInput) {
        console.log(timePickerInput)
        // 时间选择器输入框背景颜色
        timePickerInput.style.backgroundColor = config.customize.backgroundColor
        // 时间选择器输入框字体颜色
        timePickerInput.style.color = config.customize.fontColor
        // 时间选择器输入框字体大小
        timePickerInput.style.fontSize = config.customize.fontSize + 'px'
      }

      // 时间范围选择器输入框元素
      const timePickerRangeInput = timePickerEl.querySelectorAll('.el-range-input')
      console.log(timePickerRangeInput)
      timePickerRangeInput.forEach((el) => {
        // 时间范围选择器输入框背景颜色
        el.style.backgroundColor = config.customize.backgroundColor
        // 时间范围选择器输入框字体颜色
        el.style.color = config.customize.fontColor
        // 时间范围选择器输入框字体大小
        el.style.fontSize = config.customize.fontSize + 'px'
      })
      // 时间选择器图标
      const timePickerCloseIcon = timePickerEl.querySelector('.el-input__icon')
      if (timePickerCloseIcon) {
        timePickerCloseIcon.style.fontSize = config.customize.fontSize + 'px'
      }
    },
    // 组件联动
    changeValue (val) {
      this.linkage({ [this.config.code]: val })
    },
    focusEvent () {
      this.$nextTick(() => {
        const { code } = this.innerConfig
        const { dropDownBackgroundColor, dropDownFontColor, dropDownHoverFontColor, dropDownHoverBackgroundColor, dropDownSelectedFontColor } = this.innerConfig.customize
        const timePickerPopper = document.querySelector(`.date-picker-popper-${code}`)
        if (timePickerPopper) {
          // 去除边框
          timePickerPopper.style.border = 'none'
          // 确保下拉项的箭头颜色与下拉框的背景颜色保持一致
          timePickerPopper.style.color = dropDownBackgroundColor
        }
        // 下拉项元素
        const pickerDropdownPanleContent = document.querySelector(`.date-picker-popper-${code}`)
        console.log(pickerDropdownPanleContent)
        if (pickerDropdownPanleContent) {
          // 文字颜色
          pickerDropdownPanleContent.style.color = dropDownFontColor
          // 背景颜色
          pickerDropdownPanleContent.style.backgroundColor = dropDownBackgroundColor
          // 下拉项添加var变量
          pickerDropdownPanleContent.style.setProperty('--dropDownFontColor', dropDownFontColor)
          pickerDropdownPanleContent.style.setProperty('--dropDownHoverFontColor', dropDownHoverFontColor)
          pickerDropdownPanleContent.style.setProperty('--dropDownBackgroundColor', dropDownBackgroundColor)
          pickerDropdownPanleContent.style.setProperty('--dropDownSelectedFontColor', dropDownSelectedFontColor)
          pickerDropdownPanleContent.style.setProperty('--dropDownHoverBackgroundColor', dropDownHoverBackgroundColor)
          // 选中项字体颜色
          const selectedEl = pickerDropdownPanleContent.querySelector('.selected')
          if (selectedEl) {
            selectedEl.style.color = dropDownSelectedFontColor
          }
          // 选择过的，需要将选中颜色重置
          const pickerItemEl = document.querySelectorAll(`.date-picker-popper-${code} .el-time-spinner__item`)
          pickerItemEl.forEach((el) => {
            el.style.color = dropDownFontColor
          })
        }
      })
    },
    mouseenter () {
      if (this.config.customize.value) {
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
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
  }
  // 时间选择器
  .el-icon-time{
    display: flex !important;
    align-items: center !important;
  }

  // 选择日期 时间区域
  .el-date-picker__time-header{
    border-bottom:var(--dropDownBackgroundColor) !important;
    .el-input__inner{
      border: none !important;
      // 添加一点阴影
      box-shadow: 0 0 5px 0 rgba(0,0,0,0.1) !important;
      background-color: red !important;
    }
    .el-time-panel{
      border: none !important ;
      background-color: var(--dropDownBackgroundColor) !important;
    }
  }
  // 头部，修改文字颜色和图标颜色
  .el-date-picker__header{
    color: var(--dropDownFontColor) !important;
    .el-date-picker__header-label{
      color: var(--dropDownFontColor) !important;
    }
    // 左右箭头图标颜色
    .el-picker-panel__icon-btn{
      color: var(--dropDownFontColor) !important;
    }
  }
  .el-picker-panel__content{
    // 第一行tr 文字颜色
  }
  // 脚部
  .el-picker-panel__footer{
    background-color: var(--dropDownBackgroundColor) !important;
  }

  .el-time-spinner {
    margin-bottom: 0px !important;

    .el-time-spinner__item {
      &:hover {
        color: var(--dropDownHoverFontColor) !important;
        background-color: var(--dropDownHoverBackgroundColor) !important;
      }
    }

    .active {
      color: var(--dropDownSelectedFontColor) !important;

      &:hover {
        color: var(--dropDownSelectedFontColor) !important;
        background-color: transparent !important;
      }
    }
  }

  .popper__arrow {
    bottom: -6px !important;
    border-bottom-color: var(--dropDownBackgroundColor) !important;

    &::after {
      bottom: 0px !important;
      border-bottom-color: var(--dropDownBackgroundColor) !important;
    }
  }

  .cancel {
    color: var(--dropDownFontColor) !important;
  }

  .confirm {
    color: var(--dropDownSelectedFontColor);
  }

  .el-time-panel__footer {
    border-top: 1px solid var(--dropDownFontColor) !important;
  }
}
</style>

<style lang="scss" scoped>
.basic-component-date-picker {
  width: 100%;
  height: 100%;
  // 范围时间选择器连接符
  ::v-deep .el-range-separator{
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
</style>
