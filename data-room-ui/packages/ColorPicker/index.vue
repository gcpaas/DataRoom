<template>
  <div class="border-color">
    <el-input
      v-model="localValue"
      :placeholder="placeholder"
      clearable
    />
    <el-color-picker
      slot="append"
      v-model="localValue"
      popper-class="bs-el-color-picker"
      show-alpha
      :predefine="predefineColors"
    />
  </div>
</template>

<script>
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
      default: () => [
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
