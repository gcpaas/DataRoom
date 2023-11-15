<template>
  <div class="border-color">
    <el-input
      v-model="localValue"
      class="bs-el-input"
      :placeholder="placeholder"
      clearable
    />
    <el-color-picker
      slot="append"
      v-model="localValue"
      popper-class="bs-el-color-picker"
      show-alpha
      class="bs-el-color-picker"
      :predefine="predefineColors"
    />
  </div>
</template>

<script>
import { predefineColors } from 'data-room-ui/js/utils/colorList'
export default {
  name: 'ColorPicker',
  props: {
    value: {
      type: String,
      default: ''
    }, // v-model 绑定的值
    placeholder: {
      type: String,
      default: ''
    }, // 输入框的占位文本
    predefineColors: { // 预定义的主题颜色
      type: Array,
      default: () => predefineColors
    }
  },
  data () {
    return {
      localValue: this.value
    }
  },
  watch: {
    value (newValue) {
      this.localValue = newValue
    },
    localValue (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>

<style lang="scss"></style>

<style lang="scss" scoped>
@import "../assets/style/bsTheme.scss";
.border-color {
  display: flex;
  ::v-deep .el-input {
    width: auto;
    position: relative;
    margin-right: 5px;

    .el-input__inner {
      height: 32.5px;
    }
  }

  .el-input-group__append {
    width: 32.5px;
    height: 32.5px;
    background-color: var(--bs-background-1);

    .el-color-picker--mini {
      position: absolute;
      top: 1px;
      left: 7px;
    }
  }

  ::v-deep .el-color-picker__trigger {
    width: 32.5px;
    height: 32.5px;
    border-color: var(--bs-el-border);
    background-color: var(--bs-background-1);
  }
}
</style>
