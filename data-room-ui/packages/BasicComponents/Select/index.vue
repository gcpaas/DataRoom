<template>
  <el-select
    :key="config.code"
    v-model="selectValue"
    :popper-class="'basic-component-select selct-popper-' + config.code"
    :class="['basic-component-select', `selct-${config.code}`]"
    :placeholder="`请选择${placeholder}`"
    filterable
    clearable
    @visible-change="visibleChange"
    @change="selectChange"
  >
    <el-option
      v-for="(option, key) in config.option.data"
      :key="key"
      :label="option[config.dataSource.dimensionField]"
      :value="option[config.dataSource.metricField]"
    />
  </el-select>
</template>

<script>
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { getDataSetDetails } from 'data-room-ui/js/api/bigScreenApi'
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
      selectValue: '',
      innerConfig: {}
    }
  },
  computed: {
    placeholder () {
      return window.dataSetFields.find(field => field.value === this.config.dataSource.dimensionField)?.label || ''
    }
  },
  watch: { },
  created () { },
  mounted () {
    this.changeStyle(this.config)
    EventBus.$on('changeBusinessKey', () => {
      window.dataSetFields = []
    })
  },
  beforeDestroy () {
    EventBus.$off('changeBusinessKey')
  },
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
        config.customize.title = config.option.data[config.dataSource.dimensionField] || config.customize.title
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
      this.innerConfig = config
      // 选择器元素
      const selectInputEl = document.querySelector(`.selct-${config.code} .el-input__inner`)
      // 背景颜色
      selectInputEl.style.backgroundColor = config.customize.backgroundColor
      // 字体大小
      selectInputEl.style.fontSize = config.customize.fontSize + 'px'
      // 字体颜色
      selectInputEl.style.color = config.customize.fontColor
      // 选择器下拉框元素
      const selectDropdownEl = document.querySelector(`.selct-${config.code} .el-select-dropdown`)
      // 箭头背景颜色和下拉框背景颜色一致
      if (selectDropdownEl) {
        // 下拉框无边框
        selectDropdownEl.style.border = 'none'
        // 背景颜色
        selectDropdownEl.style.backgroundColor = config.customize.dropDownBackgroundColor
        // 下拉项hover颜色
        const selectDropdownItemEl = document.querySelectorAll(`.selct-${this.innerConfig.code} .el-select-dropdown__item`)
        selectDropdownItemEl.forEach(item => {
          // 下拉项字体颜色
          item.style.color = this.innerConfig.customize.dropDownFontColor
          item.addEventListener('mouseenter', () => {
            item.style.color = this.innerConfig.customize.dropDownHoverFontColor
            item.style.backgroundColor = this.innerConfig.customize.dropDownHoverBackgroundColor
          })
          item.addEventListener('mouseleave', () => {
            item.style.color = this.innerConfig.customize.dropDownFontColor
            item.style.backgroundColor = this.innerConfig.customize.dropDownBackgroundColor
          })
        })
      }
    },
    // 组件联动
    selectChange (val) {
      this.linkage(this.config.option.data.find(item => item[this.config.dataSource.metricField] === val))
    },
    visibleChange (val) {
      if (val) {
        // 修改下拉框背景颜色，让下拉框背景颜色和箭头背景颜色一致
        const selectDropdownEl = document.querySelector(`.selct-popper-${this.innerConfig.code}`)
        selectDropdownEl.style.color = this.innerConfig.customize.dropDownBackgroundColor
        // 空状态
        const selectDropdownEmptyEl = document.querySelector(`.selct-popper-${this.innerConfig.code} .el-select-dropdown__empty`)
        if (selectDropdownEmptyEl) {
          selectDropdownEmptyEl.style.backgroundColor = this.innerConfig.customize.dropDownBackgroundColor
        }
        // 激活项
        const selectDropdownItemSelectedEl = document.querySelectorAll(`.selct-popper-${this.innerConfig.code} .el-select-dropdown__item.selected`)
        selectDropdownItemSelectedEl.forEach(item => {
          item.style.color = this.innerConfig.customize.activeFontColor
          item.style.backgroundColor = this.innerConfig.customize.activeBackgroundColor
        })
      }
      // 不是激活项的还是使用背景颜色
      const selectDropdownItemEl = document.querySelectorAll(`.selct-popper-${this.innerConfig.code} .el-select-dropdown__item`)
      selectDropdownItemEl.forEach(item => {
        // 检查是否是激活项，不是则使用背景颜色
        if (!item.classList.contains('selected')) {
          item.style.color = this.innerConfig.customize.dropDownFontColor
          item.style.backgroundColor = this.innerConfig.customize.dropDownBackgroundColor
        }
      })
    }
  }

}
</script>

<style lang="scss">
.basic-component-select{
  color: '';
  .el-select-dropdown__wrap {
    margin-bottom: 0px !important;
  }
  .el-select-group__wrap:not(:last-of-type)::after {
    background-color: transparent !important;
  }
  .popper__arrow{
    border-bottom-color:var(--color) !important;
    &::after{
      border-bottom-color:var(--color) !important;
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

    //  选择器输入框样式
    .el-input__inner {
      height: 100% !important;
      border-color: var(--bs-el-border) !important;
    }
  }

  .el-tag.el-tag--info {
    color: var(--bs-el-text) !important;
  }

  .popper__arrow {
    bottom: 0 !important;

    &:after {
      bottom: 0 !important;
    }
  }
}
</style>
