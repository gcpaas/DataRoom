
<template>
  <div class="bs-gradual-wrap">
    <el-form-item
      :label="`${customLabel}渐变方向`"
      label-width="100px"
    >
      <el-radio-group
        v-model="position"
        class="bs-el-radio-group"
      >
        <el-radio label="top">
          上下
        </el-radio>
        <el-radio label="left">
          左右
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      :label="`${customLabel}渐变颜色`"
      label-width="100px"
    >
      <div class="color-picker-box">
        <el-color-picker
          v-model="startColor"
          class="bs-el-color-picker"
          popper-class="bs-el-color-picker"
        />
        <div class="el-icon-right" />
        <el-color-picker
          v-model="endColor"
          class="bs-el-color-picker"
          popper-class="bs-el-color-picker"
        />
      </div>
    </el-form-item>
  </div>
</template>

<script>
// import _ from 'lodash'
export default {
  name: 'TextGradient',
  model: {
    prop: 'colors',
    event: 'change'
  },
  props: {
    colors: {
      type: String,
      default: '',
      required: true
    },
    label: {
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
  //   newColors:
  //     {
  //       get () {
  //         return this.colors
  //       },
  //       set (val) {
  //         this.$emit('change', val)
  //       }
  //     },
    customLabel () {
      return this.label || '文字'
    }
  },
  watch: {
    colors: {
      handler (val) {
        this.init()
      },
      immediate: true
    },
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
      const arr = this.colors.split(',').map(data => data.trim()) || []
      this.position = arr[0] || 'left'
      const s = arr[1] || '#ffffff'
      const e = arr[2] || '#ffffff'
      this.startColor = s
      this.endColor = e
    },
    colorChange (val) {
      if (!this.startColor && this.endColor) {
        this.colorsValue = `${this.position} ,${this.endColor},${this.endColor}`
      } else if (this.startColor && !this.endColor) {
        this.colorsValue = `${this.position} ,${this.startColor} ,${this.startColor}`
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
@import "../../../assets/style/bsTheme.scss";
.color-picker-box{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: left;
  flex-wrap: nowrap;
  .el-icon-right{
    width: 40px;
    text-align: center;
    /*color: #778390;*/
  }
 }
</style>
