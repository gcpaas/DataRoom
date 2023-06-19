
<template>
  <div class="bs-gradual-wrap">
    <el-form-item
      label="文字渐变方向"
      label-width="100px"
    >
      <el-radio-group
        v-model="position"
        class="bs-radio-wrap"
      >
        <el-radio
          label="top"
        >
          上下
        </el-radio>
        <el-radio
          label="left"
        >
          左右
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      label="文字渐变颜色"
      label-width="100px"
    >
      <div class="color-picker-box">
        <el-color-picker v-model="startColor" /> <div class="el-icon-right" /> <el-color-picker v-model="endColor" />
      </div>
    </el-form-item>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'TextGradient',
  model: {
    prop: 'colors',
    event: 'change'
  },
  props: {
    colors: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      startColor: '', // 初始颜色
      endColor: '', // 终止颜色
      position: '', // 渐变方向
      colorsValue: ''// 拼接后的符合g2语法的颜色值

    }
  },
  computed: {
    newColors () {
      return _.cloneDeep(this.colors)
    }
  },
  watch: {
    position () {
      this.colorChange()
    },
    startColor () {
      this.colorChange()
    },
    endColor () {
      this.colorChange()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const arr = this.newColors.split(',') || []
      this.position = arr[0] || 'left'
      const s = arr[1] || '#ffffff'
      const e = arr[2] || '#ffffff'
      this.startColor = s
      this.endColor = e
    },
    colorChange (val) {
      if (!this.startColor && this.endColor) {
        this.colorsValue = `${this.position} ,#ffffff,${this.endColor}`
      } else if (this.startColor && !this.endColor) {
        this.colorsValue = `${this.position} ,${this.startColor} ,#ffffff`
      } else if (!this.startColor && !this.endColor) {
        this.colorsValue = `${this.position} ,#ffffff ,#ffffff`
      } else {
        this.colorsValue = `${this.position} ,${this.startColor} ,${this.endColor}`
      }
      this.$emit('change', this.colorsValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.color-picker-box{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: left;
  flex-wrap: nowrap;
  .el-icon-right{
    width: 40px;
    text-align: center;
  }
 }
</style>
