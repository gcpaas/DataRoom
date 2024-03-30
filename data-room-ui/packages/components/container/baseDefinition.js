
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'container',
  name: '容器', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '容器'
  },
  children: [], // 子组件
  color: '#000'
}
