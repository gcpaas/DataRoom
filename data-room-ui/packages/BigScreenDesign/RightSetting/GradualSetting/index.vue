/** * @Description: 渐变色配置 * @author liu.shiyi * @date 2023/4/13 16:01 */
<template>
  <div class="bs-gradual-wrap">
    <el-color-picker v-model="startColor" /> <div class="el-icon-right" /> <el-color-picker v-model="endColor" />
  </div>
</template>

<script>
export default {
  name: 'GradualSetting',
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
  },
  watch: {
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
      const arr = this.colors?.split(' ') || []
      this.position = arr[0]
      const s = arr[1].split(':')[1] && arr[1].split(':')[1] !== 'null' ? arr[1].split(':')[1] : ''
      const e = arr[2].split(':')[1] && arr[2].split(':')[1] !== 'null' ? arr[2].split(':')[1] : ''
      this.startColor = s
      this.endColor = e
    },
    colorChange (val) {
      this.colorsValue = `${this.position} 0:${this.startColor} 1:${this.endColor}`
      this.$emit('change', this.colorsValue)
    }
  }
}
</script>

<style lang="scss" scoped>
  .bs-gradual-wrap{
    width: 100%;
    display: flex;
    align-items: center;
    .el-icon-right{
      width: 40px;
      text-align: center;
    }
  }

</style>
