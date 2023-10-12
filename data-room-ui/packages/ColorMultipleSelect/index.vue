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
    class="bs-el-select select"
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
export default {
  name: 'ColorSelect',
  model: {
    prop: 'color',
    event: 'update'
  },
  props: {
    // 父组件绑定的值
    color: {
      type: Array,
      default: undefined
    }
  },
  data () {
    return {
      colorList: [
        {
          label: '配色1',
          value: JSON.stringify(['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'])
        },
        {
          label: '配色2',
          value: JSON.stringify(['#FF6B3B', '#626681', '#FFC100', '#9FB40F', '#76523B', '#DAD5B5', '#0E8E89', '#E19348', '#F383A2', '#247FEA'])
        },
        {
          label: '配色3',
          value: JSON.stringify(['#025DF4', '#DB6BCF', '#2498D1', '#BBBDE6', '#4045B2', '#21A97A', '#FF745A', '#007E99', '#FFA8A8', '#2391FF'])
        },
        {
          label: '配色4',
          value: JSON.stringify(['#FF4500', '#1AAF8B', '#406C85', '#F6BD16', '#B40F0F', '#2FB8FC', '#4435FF', '#FF5CA2', '#BBE800', '#FE8A26'])
        }
      ],
      colorValue: []
      // myColor: undefined
    }
  },
  watch: {
    color: function (val) {
      this.init(val)
    }
  },
  computed: {
    myColor: {
      get () {
        return JSON.stringify(this.color) || JSON.stringify(['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'])
      },
      set (val) {

      }

    }
  },
  created () {
  },
  mounted () {
    this.init(this.color)
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
      this.$emit('update', colors)
    }
  }
}
</script>

<style scoped>
</style>
