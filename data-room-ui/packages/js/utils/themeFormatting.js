/**
* @Description: 主题设置格式化
* @author liu.shiyi
* @date 2023/8/17 14:47
*/
// 将组件中的setting里面的主题设置（颜色）存放到theme里面
export function settingToTheme (config, type) {
  // 考虑与上一次保存过的主题进行合并
  // 排除掉主题非暗黑非明亮的情况
  if (['dark', 'light'].includes(type)) {
    const theme = { dark: { ...config?.theme?.dark }, light: { ...config?.theme?.light } }
    config.setting.forEach((setItem) => {
      if (['gradual', 'colorPicker'].includes(setItem.type)) {
        theme[type][setItem.field] = setItem.value
      }
    })
    return theme
  } else {
    return {}
  }
}
// 将保存的theme主题设置（颜色）存放到chartList
export function themeToSetting (chartList, type) {
  // 排除掉主题非暗黑非明亮的情况
  if (['dark', 'light'].includes(type)) {
    chartList.forEach(chart => {
      chart.option.theme = type
      chart.key = new Date().getTime()
      if (chart.theme && chart.theme[type]) {
        for (const item of chart.setting) {
          // 检查 obj 中是否存在与 item.field 相对应的属性
          if (Object.prototype.hasOwnProperty.call(chart.theme[type], item.field)) {
            // 更新 setting 中对应项的 value 值为 theme 中的属性值
            item.value = chart.theme[type][item.field]
          }
        }
      }
    })
  }
  return chartList
}
