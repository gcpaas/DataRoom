/**
* @Description: 颜色选择器
* @author liu.shiyi
* @date 2023/3/31 10:31
*/
<template>
  <el-select
    ref="colorSelect"
    v-model="myColor"
    class="bs-el-select select"
    popper-class="bs-el-select"
    placeholder=""
    style="width: 100%"
    @change="handleChange"
  >
    <div slot="prefix">
      <span style="float: left">&nbsp; </span>
      <span
        v-for="(item, index) in colorValue"
        :key="index"
      >
        <span
          v-if="index <= 14"
          :style="'float: left ;background-color:' + item + ';width:15px;border-radius:1px;display:inline-block;height:15px;margin-top:8px;'"
        />
        <span
          v-if="index <= 14"
          style="float: left"
        >
          &nbsp;
        </span>
        <span
          v-if="index === 15"
          style="float: left"
        >
          &nbsp;...
        </span>
      </span>
    </div>
    <el-option
      v-for="(item, index) in colorList"
      :key="index"
      label=" "
      :value="item"
    >
      <span
        v-for="(co, ind) in item"
        :key="ind"
      >
        <span :style="'float: left ;background-color:' + co + ';width:15px;border-radius:1px;display:inline-block;height:15px;margin-top:9px;'" />
        <span style="float: left">&nbsp; </span>
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
    // 颜色数组
    colorList: {
      type: Array,
      default: () => {
        return [
          ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
          ['#FF6B3B', '#626681', '#FFC100', '#9FB40F', '#76523B', '#DAD5B5', '#0E8E89', '#E19348', '#F383A2', '#247FEA'],
          ['#025DF4', '#DB6BCF', '#2498D1', '#BBBDE6', '#4045B2', '#21A97A', '#FF745A', '#007E99', '#FFA8A8', '#2391FF'],
          ['#FF4500', '#1AAF8B', '#406C85', '#F6BD16', '#B40F0F', '#2FB8FC', '#4435FF', '#FF5CA2', '#BBE800', '#FE8A26']
        ]
      }
    },
    // 父组件绑定的值
    color: {
      type: Array,
      default: undefined
    }
  },
  data () {
    return {
      colorValue: [],
      myColor: undefined
    }
  },
  watch: {
    color: function (val) {
      this.setSelectColor(val)
    }
  },
  created () {
    if (this.color) {
      this.myColor = this.color
      this.setSelectColor(this.color)
    }
  },
  methods: {
    // 设置颜色选择框中颜色
    setSelectColor (color) {
      this.$nextTick(() => {
        this.colorValue = this.color
      })
    },
    handleChange (val) {
      this.setSelectColor(val)
      // 触发update事件更新父组件绑定值
      this.$emit('update', val)
    }
  }
}
</script>

<style scoped>
</style>
