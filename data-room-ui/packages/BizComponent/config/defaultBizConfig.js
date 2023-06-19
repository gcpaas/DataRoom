/*
 * @description: 此处是业务组件的代码案例
 * @Date: 2023-06-06 15:45:07
 */

// vue 组件片段
export const defaultVueContent = `

<!-- 这是一个代码案例 -->
<template>
  <div class="div-test-container" @click="testClick">
    <p>点击测试下点击事件</p>
    <br />
    {{ customize.text }}
  </div>
</template>
<script>

export default {
  name: 'TestA',
  components: {
  },
  // 业务组件提供的props
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  },
  // 计算属性
  computed: {
    option () {
      return this.config.option
    },
    optionData () {
      return this.option.data
    },
    customize () {
      return this.option.customize
    }
  },
  methods: {
    // 联动需要调用次接口
    linkage (row) {
      this.$emit('linkage', row)
    },
    // 自己随便写的方法
    testClick () {
      this.$message.success('点击了边框')
    }
  }
}
</script>
<style lang="scss" scoped>
// 此处书写样式，支持scss
.div-test-container {
  width: 200px;
  height: 200px;
  border: 4px solid #f00;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  flex-direction: column;

  .item {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
}
</style>
`

// 配置 片段
export const defaultSettingContent = `
// 这是一个配置案例
//  组件备注名称
const title = '边框案例'
// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'xField',
    optionField: 'xField', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'data'
  },
  {
    label: '指标',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'yField',
    // 对应options中的字段
    optionField: 'yField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '用户名',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_username',
    optionField: 'customize.username', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '手机号',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_phone',
    optionField: 'customize.phone', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据
const data = []

const option = {
  // 数据
  data: data,
  // 数据的字段相关属性
  xField: '',
  yField: '',
  seriesField: '',
  // 自定义组件其他属性
  customize: {
    text: '这是一个边框'
  }
}

export default {
  title,
  option,
  setting
}
`
