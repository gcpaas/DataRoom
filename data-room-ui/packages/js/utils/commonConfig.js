/*
 * @description: 大屏组件通用属性
 * @Date: 2023-03-13 10:04:59
 * @Author: xing.heng
 * @LastEditors: wujian
 * @LastEditTime: 2023-06-01 14:23:23
 */

import getComponentConfig from 'packages/js/utils/getComponentConfig'
import linkageConfig from 'packages/js/config/linkageConfig'
// 关于设置组件在右侧面板可以展示哪些属性配置
export const displayOption = {
  serverPagination: {
    // 服务端分页
    enable: false
  },
  pageSize: {
    // 分页长度
    enable: false
  },
  metricField: {
    // 指标
    label: '指标',
    enable: true,
    multiple: true // 是否多选
  },
  dimensionField: {
    // 维度
    label: '维度', // 维度/查询字段
    enable: true,
    multiple: true // 是否多选
  },
  dimensionList: {
    // 维度(只有多折线图会存在两个维度)
    label: '维度', // 维度/查询字段
    enable: false,
    multiple: true // 是否多选
  },
  seriesField: {
    // 数据细分
    enable: false,
    required: true // 必填
  },
  dataAllocation: {
    // 是否存在数据配置
    enable: true
  },
  params: {
    // 参数配置
    enable: true
  },
  dataSourceType: {
    // 数据源（数据集或者其他方式：静态数据）
    enable: true
  }
}
export default function (customConfig) {
  return {
    ...getComponentConfig(customConfig.type),
    z: 0, // z轴图层支持
    locked: false, // 是否锁定组件
    group: '', // 组合组件, 相同group的组件会被组合在一起
    code: null,
    showTitle: true,
    ...customConfig.root,
    dataSource: {
      className:
        'com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource',
      dataSourceKey: '', // 数据源，选择不同数据库
      businessKey: '', // 数据集标识
      dimensionField: '', // 维度
      metricField: '', // 指标
      seriesField: '', // 分类字段
      dimensionFieldList: [], // 唯独列表
      metricFieldList: [], // 指标列表
      seriesFieldList: [], // 分类列表
      serverPagination: false, // 服务端分页
      pageSize: 10,
      params: {},
      dataSetType: '', // 数据集类型,
      formCode: '',
      ...customConfig.dataSource // 非通用数据配置
    },
    customize: {
      ...customConfig.customize
    }, // 自定义设置
    ...linkageConfig, // 数据联动配置
    filterList: [],
    dataFlag: false // 判断数据为模拟数据还是真实数据
  }
}
