<template>
  <el-input
    v-model="formattedInput"
    placeholder="Enter text, number, array, or object"
  ></el-input>
</template>

<script>
export default {
  props: {
    value: {
      // 接受任何类型的值
      type: [String, Number, Array, Object],
      default: ''
    }
  },
  computed: {
    formattedInput: {
      get() {
        if (this.value !== undefined && this.value !== null) {
          if (typeof this.value === 'object' || Array.isArray(this.value)) {
            return JSON.stringify(this.value)
          }
          return this.value.toString()
        }
        return ''
      },
      set(newValue) {
        let parsedValue
        // 尝试解析 JSON
        try {
          parsedValue = JSON.parse(newValue)
        } catch (error) {
          // 不是 JSON，尝试解析为数字
          if (!isNaN(newValue) && newValue.trim() !== '' &&  newValue.trim() !== "") {
            parsedValue = Number(newValue)
          } else {
            // 当作字符串
            parsedValue = newValue
          }
        }
        // 发射事件更新父组件的值
        this.$emit('input', parsedValue)
      }
    }
  }
};
</script>
