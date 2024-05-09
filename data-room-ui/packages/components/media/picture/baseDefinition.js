
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
  props: {
    cursor: true, // 鼠标样式
    filter: { // 滤镜
      show: true,
      hue: {
        show: true,
        hue: 0
      },
      saturate: {
        show: true,
        saturate: 100
      },
      brightness: {
        show: true,
        brightness: 100
      },
      contrast: {
        show: true,
        contrast: 100
      },
      opacity: {
        show: true,
        opacity: 1
      }
    },
    radius: 10,
    repeat: 'repeat-x',
    imageType: 'bitmap', // vector
    urlConfig: { // 链接
      url: '',
      ifBlank: false
    },
    vectorFill: { // 填充
      type: 'flat',
      value: '#a8071a'
    },
    'inner-style': {},
    vectorImage: 'https://img.alicdn.com/imgextra/i3/O1CN01I75Td61VcHWaI0C0V_!!6000000002673-55-tps-128-128.svg',
    backgroundImage: 'https://img.alicdn.com/tfs/TB1J3GkgeH2gK0jSZJnXXaT1FXa-600-360.png'
  }
}
