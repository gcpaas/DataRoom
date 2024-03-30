
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'texts',
  name: '文本', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '文本'
  },
  text: '文本标签占位符',
  data: [],
  color: '#000'
}
