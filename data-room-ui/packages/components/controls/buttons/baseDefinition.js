import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
// 打包自动生成
const version = '5c7a46df7973ea21d162e7f42e3c024b'
export default {
  ...baseDefinition,
  version: version,
  // 每个组件自定义各自的属性
  type: 'buttons',
  title: '按钮',
  // 样式属性配置
  props: {
    inputStyle: {
      // 提示文字
      placeholder: '请输入文本...',
      // 缩进
      indent: 16,
      // 输入框背景颜色
      background: '#fff',
      textStyle: { // 字体样式设置
        color: '#fff',
        fontSize: 24,
        fontFamily: 'arial',
        fontWeight: 'normal',
        italic: 'none'// 倾斜程度
      }
    }, // 输入框样式
    buttonStyle: {}, // 按键样式
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
