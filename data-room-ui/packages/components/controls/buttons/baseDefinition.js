import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  type: 'Buttons',
  name: '按钮',
  // 每个组件自定义各自的属性
  title: {
    enable: true,
    text: '按钮'
  },
  props: {
    global: {
      buttonContent: '按钮内容'
    },
    normal: {
      border: {
        borderWidth: 0,
        borderColor: '#0a73ff',
        borderRadius: 0,
        borderStyle: 'solid'
      },
      background: {
        color: 'rgba(10, 115, 255, 0.01)',
        img: '',
        repeat: false,
        size: 'contain'
      },
      textStyle: {
        color: '#fff',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontFamily: 'Microsoft Yahei',
        fontSize: 15,
        textAlign: 'center'
      }
    },
    // 点击
    click: {
      border: {
        borderWidth: 0,
        borderColor: '#00a5ff',
        borderRadius: 0.8,
        borderStyle: 'solid'
      },
      background: {
        color: 'rgba(78, 157, 255, 0)',
        img: '',
        repeat: false,
        size: 'contain'
      },
      textStyle: {
        color: '#fff',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontFamily: 'Microsoft Yahei',
        fontSize: 15,
        textAlign: 'center'
      }
    },
    // 悬浮
    hover: {
      border: {
        borderWidth: 0,
        borderColor: '#00a5ff',
        borderRadius: 0.8,
        borderStyle: 'solid'
      },
      background: {
        color: 'rgba(78, 157, 255, 0)',
        img: '',
        repeat: false,
        size: 'contain'
      },
      textStyle: {
        color: '#fff',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontFamily: 'Microsoft Yahei',
        fontSize: 15,
        textAlign: 'center'
      }
    },
    urlConfig: {
      url: '',
      ifBlank: false
    }
  }
}
