/** * @Description: 渐变色配置 * @author liu.shiyi * @date 2023/4/13 16:01 */
<template>
  <div class="bs-gradual-wrap">
    <el-color-picker
      v-model="startColor"
      class="bs-el-color-picker"
      popper-class="bs-el-color-picker"
    />
    <div :class="positionIcon" @click="positionChange" />
    <el-color-picker
      v-model="endColor"
      class="bs-el-color-picker"
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
      type: String,
      default: ''
    }
  },
  data () {
    return {
      startColor: '', // 初始颜色
      endColor: '', // 终止颜色
      position: '', // 渐变方向
      colorsValue: '',// 拼接后的符合g2语法的颜色值
      positionList: ['l(0)', 'l(90)', 'l(180)', 'l(270)'],
      positionIconList: {
        'l(0)': 'el-icon-right',
        'l(90)': 'el-icon-bottom',
        'l(180)': 'el-icon-back',
        'l(270)': 'el-icon-top'
      },
      positionIcon: 'el-icon-right'
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
      // color 格式是 'l(0) 0:#ffffff 1:#000000'
      const arr = this.colors?.split(' ') || []
      this.position = arr[0] || 'l(0)'
      this.positionIcon = this.positionIconList[this.position] || 'el-icon-right'
      const s = arr[1].split(':')[1] && arr[1].split(':')[1] !== 'null' ? arr[1].split(':')[1] : ''
      const e = arr[2].split(':')[1] && arr[2].split(':')[1] !== 'null' ? arr[2].split(':')[1] : ''
      this.startColor = s
      this.endColor = e
    },
    colorChange (val) {
      this.colorsValue = `${this.position} 0:${this.startColor} 1:${this.endColor}`
      this.$emit('change', this.colorsValue)
    },
    positionChange(){
      // 将position的值循环移动一位
      const index = this.positionList.indexOf(this.position)
      this.position = this.positionList[(index + 1) % 4]
      this.positionIcon = this.positionIconList[this.position]
      this.colorChange()
    },
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
      cursor: pointer;

    }
    .el-icon-bottom{
      width: 40px;
      text-align: center;
      cursor: pointer;
    }
    .el-icon-back{
      width: 40px;
      text-align: center;
      cursor: pointer;
    }
    .el-icon-top {
      width: 40px;
      text-align: center;
      cursor: pointer;
    }
  }

</style>
