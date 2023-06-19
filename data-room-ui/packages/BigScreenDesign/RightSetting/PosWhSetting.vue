<!--
 * @description: 组件的宽高，xy坐标设置
 * @Date: 2023-05-29 14:49:54
-->

<template>
  <div>
    <el-form-item
      :label-width="labelWidth"
      label="宽度"
    >
      <el-input-number
        v-model="config.w"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="高度"
    >
      <el-input-number
        v-model="config.h"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="x坐标"
    >
      <el-input-number
        v-model="config.x"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="y坐标"
    >
      <el-input-number
        v-model="config.y"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
  </div>
</template>
<script>
export default {
  name: '',
  props: {
    config: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
        w: 0,
        h: 0
      })
    },
    labelWidth: {
      type: String,
      default: '100px'
    }
  },
  data () {
    return {

    }
  },
  mounted () {},
  methods: {

  }
}
</script>

<style lang="scss" scoped>
</style>
