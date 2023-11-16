
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  title: '输入框',
  displayOption: {
    ...displayOption,
    dataAllocation: { enable: true },
    dataSourceType: { enable: false },
    params: { enable: false }
  }
}
const customConfig = {
  type: 'input',
  root: {
    version: '2023071001',
    // 绕x轴旋转角度
    rotateX: 0,
    // 绕y轴旋转角度
    rotateY: 0,
    // 绕z轴旋转角度
    rotateZ: 0,
    // 透视距离
    perspective: 0,
    skewX: 0,
    skewY: 0
  },
  // 自定义属性
  customize: {
    value: '',
    // 是否显示标题
    showTitle: true,
    // 标题
    title: '输入框',

    titleStyle: {
      // 标题大小
      fontSize: 14,
      // 标题颜色
      color: '#ffffff',
      // 标题间距
      marginRight: 10
    },
    inputStyle: {
      // 输入值字体大小
      fontSize: 14,
      // 输入值字体颜色
      color: '#ffffff',
      // 输入值左间距
      paddingLeft: 10
    },
    // 图标
    icon: {
      // 图标名称
      name: '',
      // 位置
      position: ''
    },
    placeholderStyle: {
    // 占位符
      placeholder: '请输入',
      // 占位符字体颜色
      placeholderColor: '#999999',
      // 占位符字体大小
      placeholderFontSize: 14
    },
    // 边框样式
    borderStyle: {
      // 边框颜色
      borderColor: '#ffffff',
      // 边框宽度
      borderWidth: 1,
      // 边框样式
      borderStyle: 'solid',
      // 边框圆角
      borderRadius: 4
    },
    backgroundStyle: {
      // 背景颜色
      backgroundColor: '#00000000'
    }
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
