import Vue from 'vue'
export const EventBus = new Vue()

export function dataInit (_this) {
  EventBus.$on('dataInit', (formData, bindComponents) => {
    // eslint-disable-next-line no-unused-expressions
    bindComponents?.forEach(com => {
      const maps = com.maps
      const filterList = maps?.map(param => ({
        column: param.targetField,
        operator: param.queryRule,
        value: formData[param.sourceField]
      }))
      _this.$nextTick(() => {
        if (_this.$refs[com.componentKey]) {
          if (_this.$refs[com.componentKey].dataInit) {
            _this.$refs[com.componentKey].dataInit(filterList)
          }
        }
      })
    })
  })
}
export function destroyedEvent () {
  EventBus.$off('dataInit')
}
