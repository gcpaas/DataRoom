/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2022-10-13 11:18:03
 * @LastEditTime: 2022-10-13 13:55:11
 */
import { commonConfig, displayOption } from 'packages/js/config'

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
    }
  }
}
const customConfig = {
  type: 'texts',
  root: {
    url: 'https://www.runoob.com/'
  },
  customize: {
    title: '文本标签占位符',
    fontSize: 20,
    fontWeight: 700,
    color: 'left,#ffffff,#ffffff'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
