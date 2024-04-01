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
  type: 'bigScreen',
  style: '',
  parentCode: '0',

  // 大屏页面的配置
  pageConfig: {
    w: 1920,
    h: 1080,
    bgColor: 'rgba(21, 26, 38, 1)', // 背景色
    bg: '', // 背景图
    lightBgColor: '#f5f7fa',
    lightBg: '',
    opacity: 100,
    customTheme: 'dark',
    themeJson: {}, // 自定义主题配置
    // 缓存的数据集 { name: '', dataSetId: '' }
    cacheDataSets: [],
    refreshConfig: [],
    // 自适应模式  无(none) 、自动(auto)、宽度铺满(fitWidth)、高度铺满(fitHeight)和 双向铺满（cover） 5 种自适应模式
    fitMode: 'cover',
    autofill: false // 背景自动填充
  },

  // 图表的集合
  chartList: []
}
