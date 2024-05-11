/** * @Description: 渐变色配置 * @author liu.shiyi * @date 2023/4/13 16:01 */
<template>
  <div class="dataroom-gradual-wrapper">
    <el-color-picker
      v-model="startColor"
      show-alpha
      color-format="hex"
      class="bs-el-color-picker"
      popper-class="bs-el-color-picker"
      @change="colorChange"
    />
    <div
      :class="positionIcon"
      @click="positionChange"
    />
    <el-color-picker
      v-model="endColor"
      show-alpha
      color-format="hex"
      class="bs-el-color-picker"
      popper-class="bs-el-color-picker"
      @change="colorChange"
    />
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'GradualSetting',
  model: {
    prop: 'color',
    event: 'change'
  },
  props: {
    color: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      startColor: '', // 初始颜色
      endColor: '', // 终止颜色
      position: '', // 渐变方向
      colorsValue: '', // 拼接后的符合g2语法的颜色值
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
  inject: ['canvasInst'],
  watch: {
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 匹配方向
      const regex = /l\(\d+\)/
      this.position = this.color?.match(regex)[0]
      // 设置颜色的正则表达式 # 匹配RGBA颜色值的模式
      const pattern = /rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g // 匹配RGBA颜色值的模式
      // 使用正则表达式查找匹配项
      const matches = this.color?.match(pattern)
      // 提取匹配项中的颜色
      this.startColor = matches[0]
      this.endColor = matches[1]
    },
    colorChange (val) {
      this.colorsValue = `${this.position} 0:${this.startColor} 1:${this.endColor}`
      this.$emit('change', this.colorsValue)
    },
    positionChange () {
      // 将position的值循环移动一位
      const index = this.positionList.indexOf(this.position)
      this.position = this.positionList[(index + 1) % 4]
      this.positionIcon = this.positionIconList[this.position]
      this.colorChange()
    }
  }
}
</script>

<style lang="scss" scoped>

  .dataroom-gradual-wrapper{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content:end;
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
