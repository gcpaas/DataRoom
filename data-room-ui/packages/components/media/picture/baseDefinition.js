
import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'picture',
  name: '图片', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '图片'
  },
  url: 'http://192.168.59.45:8082/dataRoomServer/static/1769660594975154178.png'
}
