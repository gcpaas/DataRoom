<template>
  <div class="basic-component-input">
    <span
      v-if="config.customize.showTitle"
      class="title-left"
      :style="{ marginRight: config.customize.titleStyle.marginRight + 'px', fontSize: config.customize.titleStyle.fontSize + 'px', color: config.customize.titleStyle.color }"
    >
      {{ config.customize.title }}
    </span>
    <el-input
      :id="`el-input-${config.code}`"
      v-model="value"
      type="text"
      resize="both"
      class="input-component"
      :placeholder="config.customize.placeholderStyle.placeholder"
      :style="{ backgroundColor: config.customize.backgroundStyle.backgroundColor,'--input-placeholder-color': config.customize.placeholderStyle.placeholderColor, '--input-placeholder-font-size': config.customize.placeholderStyle.placeholderFontSize + 'px' }"
      @input="handleInput"
      @keyup.enter.native="keyupEnter"
    >
      <i
        v-if="config.customize.icon.position === 'left' && config.customize.icon.name"
        slot="prefix"
        class="el-input__icon"
        :class="config.customize.icon.position === 'left' ? config.customize.icon.name : ''"
      />
      <i
        v-if="config.customize.icon.position === 'right' && config.customize.icon.name"
        slot="suffix"
        class="el-input__icon"
        :class="config.customize.icon.position === 'right' ? config.customize.icon.name : ''"
      />
    </el-input>
  </div>
</template>

<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import _ from 'lodash'
export default {
  name: 'BasicComponentInput',
  mixins: [commonMixins, linkageMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      value: '',
      timer: null
    }
  },
  watch: {
    'config.customize': {
      handler () {
        this.changeStyle(this.config, true)
      },
      deep: true
    }
  },
  mounted () {
    this.chartInit()
    this.changeStyle(this.config)
  },
  beforeDestroy () {
    // 销毁时清除定时器
    clearTimeout(this.timer)
  },
  methods: {
    changeStyle (config, isUpdateTheme) {
      config = { ...this.config, ...config }
      const input = document.querySelector(`#el-input-${config.code}`)
      // const inputIcon = input.querySelector(`.${this.config.customize.icon.name}`)
      input.style.backgroundColor = config.customize.backgroundStyle.backgroundColor
      input.style.fontSize = config.customize.inputStyle.fontSize + 'px'
      input.style.color = config.customize.inputStyle.color
      input.style.borderColor = config.customize.borderStyle.borderColor
      input.style.borderWidth = config.customize.borderStyle.borderWidth + 'px'
      input.style.borderStyle = config.customize.borderStyle.borderStyle
      input.style.borderRadius = config.customize.borderStyle.borderRadius + 'px'
      // inputIcon.style.fontSize = this.config.customize.inputStyle.fontSize + 'px'
      if (config.customize.icon.name) {
        const inputIcon = document.querySelector(`.${config.customize.icon.name}`)
        inputIcon.style.fontSize = config.customize.inputStyle.fontSize + 'px'
      }
      // 只有样式改变时更新主题配置，切换主题时不需要保存
      if (!isUpdateTheme) {
        config.theme = settingToTheme(_.cloneDeep(config), this.customTheme)
        this.changeChartConfig(config)
        if (config.code === this.activeCode) {
          this.changeActiveItemConfig(config)
        }
      }
    },
    handleInput (val) {
      // 提供一个防抖的方法
      this.debounce(() => {
        this.linkage({ [this.config.code]: val })
      })
    },
    keyupEnter () {
      this.linkage({ [this.config.code]: this.value })
    },
    debounce (fn, delay = 500) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        fn()
      }, delay)
    }
  }
}
</script>

<style>
/* 修改输入框的 placeholder 文字颜色 */
input::placeholder {
  color: red; /* 设置占位文字颜色为灰色 */
}

</style>

<style lang="scss" scoped>
.basic-component-input {
  width: 100%;
  display: flex;
  .title-left {
    display: block;
    white-space: nowrap;
    align-self: center;
  }
  .el-input {
    height: 100%;
    width: 100%;

    ::v-deep .el-input__inner {
      height: 100%;
      width: 100%;
      background-color:#151a26;
      border: 1px solid #DCDFE6;
    }
  }
  ::v-deep .el-input__inner::placeholder {
   color: var(--input-placeholder-color);
   font-size: var(--input-placeholder-font-size);
 }
}

</style>
