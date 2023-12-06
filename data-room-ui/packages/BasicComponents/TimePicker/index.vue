<template>
  <el-time-picker
    v-model="value"
    :picker-options="config.customize.pickerOptions"
    placeholder="选择时间"
    clearable
    :class="['basic-component-time-picker', `time-picker-${config.code}`]"
    :popper-class="'basic-component-time-picker time-picker-popper-' + config.code"
    :format="config.customize.format"
    :value-format="config.customize.format"
    :default-value="value"
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
import { getDataSetDetails } from 'data-room-ui/js/api/bigScreenApi'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import { mapState } from 'vuex'
window.dataSetFields = []
export default {
  name: 'BasicComponentsTimePicker',
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
        if (val === 'timestamp') {
          this.value = new Date().getTime()
        } else if (val === 'custom') {
          const newFomat = this.config.customize.format.replace(/y/g, 'Y').replace(/d/g, 'D')
          this.value = moment(new Date()).format(newFomat)
        }
      },
      immediate: true
    },
    'config.customize.format': {
      handler (val) {
        if (this.config.customize.formatType === 'timestamp') {
          this.value = new Date().getTime()
        } else if (this.config.customize.formatType === 'custom') {
          const newFomat = val.replace(/y/g, 'Y').replace(/d/g, 'D')
          this.value = moment(new Date()).format(newFomat)
        }
      },
      immediate: true
    }
  },
  created () { },
  mounted () {
    if (!this.isPreview) {
      document.querySelector(`.time-picker-${this.config.code}`).style.pointerEvents = 'none'
    }
    if (this.value === '') {
      const newFomat = this.config.customize.format.replace(/y/g, 'Y').replace(/d/g, 'D')
      this.value = moment(new Date()).format(newFomat)
    }
    this.changeStyle(this.config)
  },
  beforeDestroy () { },
  methods: {
    dataFormatting (config, data) {
      // 数据返回成功则赋值
      if (data.success) {
        data = data.data
        // 获取到后端返回的数据，有则赋值
        if (config.dataHandler) {
          try {
            // 此处函数处理data
            eval(config.dataHandler)
          } catch (e) {
            console.info(e)
          }
        }
        config.option.data = data
        // config.customize.title = config.option.data[config.dataSource.dimensionField] || config.customize.title
        if (window.dataSetFields.length === 0) {
          getDataSetDetails(this.config.dataSource.businessKey).then(res => {
            window.dataSetFields = res.fields.map(field => {
              return {
                label: field.comment || field.fieldDesc,
                value: field.name || field.fieldName
              }
            })
          })
        }
        // 语音播报
      } else {
        // 数据返回失败则赋前端的模拟数据
        config.option.data = []
      }
      return config
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      this.innerConfig = config
      // 时间选择器元素
      const timePicker = document.querySelector(`.time-picker-${config.code} .el-input__inner`)
      // 时间选择器背景颜色
      timePicker.style.backgroundColor = config.customize.backgroundColor
      // 时间选择器字体颜色
      timePicker.style.color = config.customize.fontColor
      // 时间选择器字体大小
      timePicker.style.fontSize = config.customize.fontSize + 'px'
      // 时间选择器图标
      const timePickerCloseIcon = document.querySelector(`.time-picker-${config.code} .el-input__icon`)
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
        const timePickerPopper = document.querySelector(`.time-picker-popper-${code}`)
        if (timePickerPopper) {
          // 去除边框
          timePickerPopper.style.border = 'none'
          // 确保下拉项的箭头颜色与下拉框的背景颜色保持一致
          timePickerPopper.style.color = dropDownBackgroundColor
        }
        // 下拉项背景颜色
        const pickerDropdownPanleContent = document.querySelector(`.time-picker-popper-${code}`)
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
          const pickerItemEl = document.querySelectorAll(`.time-picker-popper-${code} .el-time-spinner__item`)
          pickerItemEl.forEach((el) => {
            el.style.color = dropDownFontColor
          })
        }
      })
    },
    mouseenter () {
      if (this.value) {
        setTimeout(() => {
          // 清空图标
          const timePickerCloseIcon = document.querySelector(`.time-picker-${this.innerConfig.code} .el-icon-circle-close`)
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
.basic-component-time-picker {
  color: '';

  // 清空图标
  .el-icon-circle-close {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
  }

  // 时间选择器
  .el-icon-time {
    display: flex !important;
    align-items: center !important;
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
    border-top: 1px solid var(--dropDownFontColor);
    border-bottom: 1px solid var(--dropDownFontColor);
  }

  .popper__arrow {
    border-bottom-color: var(--dropDownBackgroundColor) !important;

    &::after {
      top: 0px !important;
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
    border-color: 1px solid var(--dropDownFontColor) !important;
  }
}
</style>

<style lang="scss" scoped>
.basic-component-time-picker {
  width: 100% !important;
  height: 100% !important;

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
