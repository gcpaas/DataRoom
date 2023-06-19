/*
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2022-10-13 11:18:03
 * @LastEditTime: 2022-10-13 13:55:11
 */
import { commonConfig, displayOption } from 'packages/js/config'

export const settingConfig = {
  theme: 'dark',
  text: '超链接占位符', // text内容
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
  type: 'linkChart',
  root: {
    url: 'https://www.runoob.com/'
  },
  customize: {
    title: '超链接占位符',
    fontSize: 20,
    fontWeight: 700,
    color: 'left,#ffffff,#ffffff',
    url: '', // 链接地址
    openType: '', // 打开方式
    dialogW: 1000, // 弹窗宽度
    dialogH: 500// 弹窗高度
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
