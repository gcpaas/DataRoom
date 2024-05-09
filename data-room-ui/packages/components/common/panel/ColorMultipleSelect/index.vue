/**
* @Description: 颜色选择器
* @author liu.shiyi
* @date 2023/3/31 10:31
*/
<template>
  <el-select
    ref="colorSelect"
    v-model="myColor"
    value-key="value"
    class="dataroom-color-multiple-wrapper bs-el-select select"
    popper-class="bs-el-select"
    placeholder=""
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="(item, index) in colorList"
      :key="index"
      :label="item.label"
      :value="item.value"
    >
      <span style="float: left">{{ item.label }}</span>
      <span style="float: right">
        <span
          v-for="(co, ind) in JSON.parse(item.value)"
          :key="ind"
        >
          <span :style="'float: left ;background-color:' + co + ';width:10px;border-radius:1px;display:inline-block;height:15px;margin-top:9px;'" />
          <span style="float: left">&nbsp; </span>
        </span>
      </span>
    </el-option>
  </el-select>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'ColorSelect',
  model: {
    prop: 'config',
    event: 'change'
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      colorList: [
        {
          label: '配色1',
          value: JSON.stringify(['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'])
        },
        {
          label: '配色2',
          value: JSON.stringify(['#1DAEFF', '#25A979', '#D19C4C', '#654FEA', '#C957CB'])
        },
        {
          label: '配色3',
          value: JSON.stringify(['#1DAEFF', '#15BCE0', '#1FD7CC', '#43D4A0', '#25A979'])
        }
      ],
      colorValue: []
      // myColor: undefined
    }
  },
  watch: {
    // color: function (val) {
    //   this.init(val)
    // }
  },
  computed: {
    myColor: {
      get () {
        return JSON.stringify(this.config.option.color) || JSON.stringify(['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'])
      },
      set (val) {

      }

    }
  },
  inject: ['canvasInst'],
  created () {
  },
  mounted () {
    this.init(this.config.option.color)
  },
  methods: {
    // 初始化colorList,当绑定的颜色跟预设的颜色不一致时
    init (color) {
      // ,当绑定的颜色跟预设的颜色是否一致
      const flag = this.colorList.some(co => co.value === JSON.stringify(color))
      // colorList是否存在自定义选项
      const f = this.colorList.some(co => co.label === '自定义')
      if (!flag) {
        if (f) {
          this.colorList = this.colorList.map(co => {
            if (co.label === '自定义') {
              return {
                label: '自定义',
                value: JSON.stringify(color)
              }
            } else {
              return co
            }
          })
        } else {
          this.colorList.push({
            label: '自定义',
            value: JSON.stringify(color)
          })
        }
      }
    },
    handleChange (val) {
      const colors = JSON.parse(val)
      // 触发update事件更新父组件绑定值
      // this.$emit('update', colors)
      const config = cloneDeep(this.config)
      config.option.color = colors
      this.canvasInst.updateChartConfig(config)
      this.canvasInst.updateStyleHandler(config)
    }
  }
}
</script>

<style scoped>
</style>
