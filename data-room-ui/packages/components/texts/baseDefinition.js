
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
  // 样式属性配置
  props: {
    cursor: true, // 是否显示链接的鼠标样式
    content: '我是标题数据', // 标题内容
    ellipsis: true, // 是否显示省略号
    textAlign: { // 文本对齐
      horiAlign: 'center',
      vertiAlign: 'center'
    },
    textStyle: { // 字体样式设置
      color: '#fff',
      fontSize: 24,
      fontFamily: 'arial',
      fontWeight: 'normal'
    },
    urlConfig: { // 链接设置
      url: '',
      ifBlank: false
    },
    textShadow: [// 文本阴影
      {
        blur: 0,
        color: '#ffe58f',
        offset: {
          offsetX: 0,
          offsetY: 0
        },
        _active: true
      }
    ],
    writingMode: 'horizontal-tb', // 文字排列方向
    letterSpacing: 10, // 文本间隔
    backgroundStyle: { // 背景样式设置
      show: false,
      bgColor: '',
      bgBorder: {
        color: '',
        curve: 'polyline',
        style: 'solid',
        width: 0
      },
      borderRadius: 10
    }
  }
}
