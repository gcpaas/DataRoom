<template>
  <el-select
    :key="config.code"
    v-model="value"
    :popper-class="'basic-component-select select-popper-' + config.code"
    :class="['basic-component-select', `select-${config.code}`]"
    :placeholder="config.customize.placeholder"
    clearable
    :filterable="filterable"
    :style="{'--input-placeholder-color':config.customize.placeholderColor,'--input-placeholder-font-size':config.customize.placeholderFontSize + 'px'}"
    @visible-change="visibleChange"
    @change="selectChange"
    @mouseenter.native="mouseenter"
  >
    <el-option
      v-for="(option, key) in optionData"
      :key="key"
      :label="option[config.dataSource.dimensionField]"
      :value="option[config.dataSource.metricField]"
    />
  </el-select>
</template>

<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
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
      innerConfig: {},
      optionData: [],
      filterable: false
    }
  },
  computed: {
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  watch: {},
  created () {
  },
  mounted () {
    this.changeStyle(this.config)
    if (this.isPreview) {
      this.filterable = true
    } else {
      document.querySelector(`.select-${this.config.code}`).style.pointerEvents = 'none'
    }
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
        this.optionData = data
        // 语音播报
      } else {
        // 数据返回失败则赋前端的模拟数据
        config.option.data = []
        this.optionData = []
      }
      return config
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      this.innerConfig = config
      // 选择器元素
      const selectInputEl = document.querySelector(`.select-${config.code} .el-input__inner`)
      // 背景颜色
      selectInputEl.style.backgroundColor = config.customize.backgroundColor
      // 字体大小
      selectInputEl.style.fontSize = config.customize.fontSize + 'px'
      // 字体颜色
      selectInputEl.style.color = config.customize.fontColor
      // 边框颜色
      selectInputEl.style.borderColor = config.customize.borderColor
      // 下拉图标
      const selectDropdownIcon = document.querySelector(`.select-${config.code} .el-icon-arrow-up`)
      selectDropdownIcon.style.fontSize = config.customize.fontSize + 'px'
      // 选择器下拉框元素
      const selectDropdownEl = document.querySelector(`.select-${config.code} .el-select-dropdown`)
      // 箭头背景颜色和下拉框背景颜色一致
      if (selectDropdownEl) {
        // 下拉框无边框
        selectDropdownEl.style.border = 'none'
        // 背景颜色
        selectDropdownEl.style.backgroundColor = config.customize.dropDownBackgroundColor
      }
    },
    // 组件联动
    selectChange (val) {
      if (val) {
        this.linkage(this.optionData.find(item => item[this.config.dataSource.metricField] === val))
      }
    },
    visibleChange (val) {
      if (val) {
        // 修改下拉框背景颜色，让下拉框背景颜色和箭头背景颜色一致
        const selectDropdownEl = document.querySelector(`.select-popper-${this.innerConfig.code}`)
        selectDropdownEl.style.color = this.innerConfig.customize.dropDownBackgroundColor
        // 空状态
        const selectDropdownEmptyEl = document.querySelector(`.select-popper-${this.innerConfig.code} .el-select-dropdown__empty`)
        if (selectDropdownEmptyEl) {
          selectDropdownEmptyEl.style.backgroundColor = this.innerConfig.customize.dropDownBackgroundColor
        }
        // 下拉项hover颜色
        const selectDropdownWrap = document.querySelector(`.select-popper-${this.innerConfig.code} .el-select-dropdown__wrap`)
        selectDropdownWrap.style.setProperty('--drop-down-hover-font-color', this.innerConfig.customize.dropDownHoverFontColor)
        selectDropdownWrap.style.setProperty('--drop-down-hover-background-color', this.innerConfig.customize.dropDownHoverBackgroundColor)
      }
      // 不是激活项的还是使用背景颜色
      const selectDropdownItemEl = document.querySelectorAll(`.select-popper-${this.innerConfig.code} .el-select-dropdown__item`)
      selectDropdownItemEl.forEach(item => {
        // 检查是否是激活项，不是则使用背景颜色
        if (!item.classList.contains('selected')) {
          item.style.color = this.innerConfig.customize.dropDownFontColor
          item.style.backgroundColor = this.innerConfig.customize.dropDownBackgroundColor
        }
      })
    },
    // 鼠标进入
    mouseenter () {
      if (this.value) {
        setTimeout(() => {
          // 清空图标
          const selectDropdownCloseIcon = document.querySelector(`.select-${this.innerConfig.code} .el-icon-circle-close`)
          if (selectDropdownCloseIcon) {
            selectDropdownCloseIcon.style.fontSize = this.innerConfig.customize.fontSize + 'px'
          }
        }, 30)
      }
    }
  }

}
</script>

<style lang="scss">
.basic-component-select {
  .el-select-dropdown__wrap {
    margin-bottom: 0px !important;
  }

  .el-select-group__wrap:not(:last-of-type)::after {
    background-color: transparent !important;
  }

  .popper__arrow {
    bottom: -6px !important;
    border-top-color: var(--color) !important;
    border-bottom-color: var(--color) !important;

    &::after {
      bottom: 0px !important;
      border-top-color: var(--color) !important;
      border-bottom-color: var(--color) !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.basic-component-select {
  width: 100%;
  height: 100%;

  ::v-deep .el-input {
    height: 100% !important;

    .el-select__caret {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
    }

    //  选择器输入框样式
    .el-input__inner {
      height: 100% !important;
    }
  }
  ::v-deep .el-input__inner::placeholder {
      color: var(--input-placeholder-color);
      font-size: var(--input-placeholder-font-size);
    }
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    color: var(--drop-down-hover-font-color) !important;
    background-color: var(--drop-down-hover-background-color) !important;
  }

  .el-tag.el-tag--info {
    color: var(--bs-el-text) !important;
  }
}
</style>
