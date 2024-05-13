
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'inputs',
  name: '输入框', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '输入框'
  },
  // 样式属性配置
  props: {
    placeholder: '请输入文本...', // 占位符内容
    indent: 15, // 缩进
    clearable: true, // 可清空
    textStyle: {
      color: '#ffffff',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontFamily: 'Microsoft Yahei',
      fontSize: 15
    },

    placeholderStyle: { // 占位符样式
      color: '#ffccc7',
      fontStyle: 'italic',
      fontWeight: 'bold',
      fontFamily: 'Microsoft Yahei',
      fontSize: 14
    },
    background: '#363636', // 输入框背景颜色
    normal: { // 普通样式
      border: {
        borderWidth: 0,
        borderColor: '#2069f9',
        borderRadius: 8,
        borderStyle: 'solid'
      }
    },
    // 是否改成：clickStyle?hoverStyle？？
    click: { // 点击样式======>
      border: {
        borderWidth: 0,
        borderColor: '#2069f9',
        borderRadius: 8,
        borderStyle: 'solid'
      }
    },
    hover: { // 悬浮样式
      border: {
        borderWidth: 0,
        borderColor: '#2069f9',
        borderRadius: 8,
        borderStyle: 'solid'
      }
    }
  }

}
