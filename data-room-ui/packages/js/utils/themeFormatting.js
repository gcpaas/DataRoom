
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
    // 根据组件的type来判断主题的转化方式
    // 如果是g2组件或者远程组件
    if (['customComponent', 'remoteComponent', 'echartsComponent'].includes(config.type)) {
      config.setting.forEach((setItem) => {
        if (['gradual', 'colorPicker', 'colorSelect'].includes(setItem.type)) {
          theme[type][setItem.field] = setItem.value
        }
      })
    } else {
      // 如果是普通组件
      if (config.customize && Object.keys(config.customize).length) {
        // customize属性存在层级
        for (const item in config.customize) {
          const value = config.customize[item]
          // 如果包含二级属性
          if (value && typeof value === 'object' && Object.keys(value).length) {
            // 对于二级属性
            for (const subKey in value) {
              if (subKey.includes('color') || subKey.includes('Color') || subKey.includes('BGC')) {
                theme[type][`${item}_${subKey}`] = value[subKey]
              }
            }
          } else {
            // 如果只有一级属性
            if (item.includes('color') || item.includes('Color') || item.includes('BGC')) {
              theme[type][item] = config.customize[item]
            }
          }
        }
      }
    }
    return theme
  } else {
    return config?.theme || { dark: {}, light: {} }
  }
}
// 将保存的theme主题设置（颜色）存放到chartList
export function themeToSetting (chartList, type) {
  let modifiedChartList = chartList
  let finalChartList = chartList
  // 排除掉主题非暗黑非明亮的情况
  if (['dark', 'light'].includes(type)) {
    modifiedChartList = chartList.map((item) => {
      // 使用 map 方法遍历 chartList 数组并执行操作chartThemeToSetting
      return chartThemeToSetting(item, type)
    })
    finalChartList = modifiedChartList.map((item) => {
      // 如果当前项的 type 为 'chartTab'，遍历其 tabList 数组并执行操作chartThemeToSetting
      if (item.type === 'chartTab' && Array.isArray(item.customize.tabList) && item.customize.tabList.length) {
        const modifiedChildren = item.customize.tabList.map((child) => {
          return { ...child, chart: chartThemeToSetting(child.chart, type) }
        })
        return { ...item, customize: { ...item.customize, tabList: modifiedChildren } }
      }
      return item
    })
  }
  return finalChartList
}
// 对单个组件进行主题设置（从theme到Setting）
function chartThemeToSetting (chart, type) {
  if (chart.option && chart.option.theme) {
    chart.option.theme = type === 'dark' ? 'transparent' : 'light'
  }

  if (chart.theme && chart.theme[type]) {
    // 如果是g2组件或者远程组件
    if (['customComponent', 'remoteComponent', 'echartsComponent'].includes(chart.type)) {
      for (const item of chart.setting) {
        // 检查 obj 中是否存在与 item.field 相对应的属性
        if (Object.prototype.hasOwnProperty.call(chart.theme[type], item.field)) {
          // 更新 setting 中对应项的 value 值为 theme 中的属性值
          item.value = chart.theme[type][item.field]
        }
      }
    } else {
      // 如果是普通组件
      if (chart.customize && Object.keys(chart.customize).length) {
        for (const key in chart.theme[type]) {
          const value = chart.theme[type][key]
          // 如果对应的是二级属性
          if (key.includes('_')) {
            const [propertyName, subPropertyName] = key.split('_')
            if (!chart.customize[propertyName]) {
              chart.customize[propertyName] = {}
            } else {
              chart.customize[propertyName][subPropertyName] = value
            }
          } else {
            // 对应的一级属性
            if (Object.prototype.hasOwnProperty.call(chart.customize, key)) {
              // 更新 customize 中对应项的值为 theme 中的属性值
              chart.customize[key] = chart.theme[type][key]
            }
          }
        }
        for (const item in chart.customize) {
          // 检查 obj 中是否存在与 customize 相对应的属性
          if (Object.prototype.hasOwnProperty.call(chart.theme[type], item)) {
            // 更新 customize 中对应项的值为 theme 中的属性值
            chart.customize[item] = chart.theme[type][item]
          }
        }
      }
    }
  }
  return chart
}
