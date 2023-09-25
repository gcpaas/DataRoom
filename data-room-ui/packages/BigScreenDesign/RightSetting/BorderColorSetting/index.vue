/** * @Description: 渐变色配置 * @author liu.shiyi * @date 2023/4/13 16:01 */
<template>
  <div class="bs-gradual-wrap">
    <el-color-picker
      v-model="startColor"
      class="bs-el-color-picker"
      show-alpha
      popper-class="bs-el-color-picker"
    />
    <div class="el-icon-right" />
    <el-color-picker
      v-model="endColor"
      class="bs-el-color-picker"
      show-alpha
      popper-class="bs-el-color-picker"
    />
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
      type: Array,
      default: ()=>([])
    }
  },
  data () {
    return {
      startColor: '', // 初始颜色
      endColor: '', // 终止颜色
          }
  },
  computed: {
  },
  watch: {
    colors(){
      this.init()
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
      this.startColor = this.colors[0]
      this.endColor = this.colors[1]
    },
    colorChange (val) {
      const colorsValue = (this.startColor||this.endColor)?[this.startColor,this.endColor]:[]
      this.$emit('change', colorsValue)
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
