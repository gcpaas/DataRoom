import Vue from 'vue'

// 创建全局唯一的 EventBus 实例
export const EventBus = new Vue()

// 创建唯一的事件处理函数
function dataInitHandler (_this, formData, bindComponents, linkageType) {
  bindComponents?.forEach(com => {
    if (linkageType === 'dataLoaded') {
      // 数据初始化加载时，只需要考虑初始化交互
      const maps = com.maps
      const filterList = maps
        ?.filter(param => param.timing === 'dataLoaded') // 先过滤
        .map(param => {
          let index = 0
          switch (param.mappingIndex) {
            case 'first':
              index = 0
              break
            case 'last':
              index = formData.length - 1
              break
            default: {
              const i = parseInt(param.mappingIndex, 10)
              index = Number.isNaN(i) ? 0 : i // 兜底
            }
          }
          // 防止越界
          const safeIndex = Math.max(0, Math.min(index, formData.length - 1))
          const value = formData[safeIndex]?.[param.sourceField] ?? null

          return {
            column: param.targetField,
            operator: param.queryRule,
            value
          }
        }) ?? []
      _this.$nextTick(() => {
        if (_this.$refs[com.componentKey] && _this.$refs[com.componentKey].dataInit) {
          _this.$refs[com.componentKey].dataInit(filterList)
        }
      })
    } else {
      const maps = com.maps
      const filterList = maps?.filter(param => !param?.timing || param.timing !== 'dataLoaded')
        .map(param => ({
          column: param.targetField,
          operator: param.queryRule,
          value: formData[param.sourceField]
        }))

      _this.$nextTick(() => {
        if (_this.$refs[com.componentKey] && _this.$refs[com.componentKey].dataInit) {
          _this.$refs[com.componentKey].dataInit(filterList)
        }
      })
    }
  })
}

// 注册事件监听器
export function dataInit (_this) {
  EventBus.$on('dataInit', (formData, bindComponents, linkageType) => {
    // 在回调中调用处理函数并传递组件实例
    dataInitHandler(_this, formData, bindComponents, linkageType)
  })
}

export function destroyedEvent () {
  EventBus.$off('dataInit', dataInitHandler)
}
