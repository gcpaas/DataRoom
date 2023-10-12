/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2022-10-13 11:18:03
 * @LastEditTime: 2022-10-13 13:55:11
 */
import { commonConfig, displayOption } from 'data-room-ui/js/config'

export const settingConfig = {
  theme: 'dark',
  text: '文本标签占位符', // text内容
  // 设置面板属性的显隐
  displayOption: {
    ...displayOption,
    metricField: {
      // 指标
      label: '指标',
      enable: true,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 维度
      label: '维度', // 维度/查询字段
      enable: false,
      multiple: true // 是否多选
    },
    text: { // 文本占位符
      label: '文本内容', // 维度/查询字段
      enable: true
    },
    expression: { // 文本占位符
      label: '表达式', // 维度/查询字段
      enable: true
    }
  }
}
const customConfig = {
  type: 'texts',
  root: {
    version: '2023071001',
    url: 'https://www.runoob.com/',
    expression: 'return ',
    expressionCodes: [],
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0
  },
  customize: {
    title: '文本标签占位符',
    fontSize: 20,
    fontWeight: 700,
    fontFamily: '', // 字体类型
    color: 'left,#ffffff,#ffffff'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
