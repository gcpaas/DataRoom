/**
 * 组件通用配置
 */
export default {
  // 版本号，打包自动生成
  version: '',
  code: '', // 组件code
  w: 6, // 宽度
  h: 4, // 高度
  x: 0, // x坐标
  y: 0, // y坐标
  z: 0, // 组件层级
  transform: 'perspective(1000px) translate(0px, 0px) skew(0deg, 0deg) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
  rotateX: 0, // 旋转x角度
  rotateY: 0, // 旋转y角度
  rotateZ: 0, // 旋转z角度
  perspective: 1000, // 透视距离
  skewX: 0, // x扭曲角度
  skewY: 0, // y扭曲角度
  locked: false, // 是否锁住
  group: '', // 是否分组
  parentCode: null, // 父节点code
  children: [], // 子节点列表
  border: { // 组件边框样式
    type: '',
    titleHeight: 30,
    fontSize: 14,
    isTitle: true,
    fontColor: '#e9e9e9',
    padding: [0, 0, 0, 0]
  },
  dataSource: { // 数据集配置
    businessKey: '', // 数据集
    dimensionField: '', // 维度
    metricField: '', // 指标
    classifiedField: '', // 分类
    params: {}, // 数据集参数
    dataHandleFilterId: '', // 数据处理过滤器id
    parameterMapping: [], // 数据集参数映射
    initRequestData: true// 初始化请求数据
  },
  fieldMapping: [],
  interaction: [// 交互列表
    // {
    //   name: '事件名称',
    //   children: [
    //     { // 每个事件对应的动作列表
    //       action: '动作名称',
    //       target: '⽬标组件',
    //       params: {}
    //     }
    //   ]
    // }
  ]
}
