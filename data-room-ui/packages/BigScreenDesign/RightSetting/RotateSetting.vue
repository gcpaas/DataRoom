<!--
 * @description: 旋转的角度
-->

<template>
  <div>
    <el-form-item
      :label-width="labelWidth"
      label="透视距离"
    >
      <el-input-number
        v-model="config.perspective"
        class="bs-el-input-number"
        :min="0"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="绕x轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateX"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="绕y轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateY"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="绕z轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateZ"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="沿x轴扭曲角度"
    >
      <el-input-number
        v-model="config.skewX"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
      />
    </el-form-item>
    <el-form-item
      :label-width="labelWidth"
      label="绕y轴扭曲角度"
    >
      <el-input-number
        v-model="config.skewY"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
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
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        perspective: 0,
        skewX: 0,
        skewY: 0
      })
    },
    labelWidth: {
      type: String,
      default: '120px'
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