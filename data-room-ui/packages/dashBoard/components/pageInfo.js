export default {
  className:
    'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO',
  id: '',
  name: '测试',
  code: '',
  icon: '',
  iconColor: '#007aff',
  orderNum: 0,
  remark: '',
  type: 'dashBoard',
  style: '',
  parentCode: '0',

  // 大屏页面的配置
  pageConfig: {
    w: 1920,
    h: 1080,
    bgColor: '#DFE1E3', // 背景色
    bg: '', // 背景图
    lightBgColor: '##F4F6F9',
    lightBg: '',
    opacity: 100,
    customTheme: 'dark',
    themeJson: {}, // 自定义主题配置
    // 缓存的数据集 { name: '', dataSetId: '' }
    cacheDataSets: [],
    refreshConfig: []
  },

  // 图表的集合
  chartList: []
}
