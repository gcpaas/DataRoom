
import { commonConfig } from 'packages/js/config'

export const settingConfig = {
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
  type: 'input',
  // 自定义属性
  // 输入框的值
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
      color: '#fff',
      // 标题间距
      marginRight: 10
    },
    inputStyle: {
      // 输入值字体大小
      fontSize: 20,
      // 输入值字体颜色
      color: '#fff',
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
      placeholderColor: 'red'
    },
    // 边框样式
    borderStyle: {
      // 边框颜色
      borderColor: '#dcdfe6',
      // 边框宽度
      borderWidth: 1,
      // 边框样式
      borderStyle: 'solid',
      // 边框圆角
      borderRadius: 4
    },
    backgroundStyle: {
      // 背景颜色
      backgroundColor: '#151a26'
    }
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
