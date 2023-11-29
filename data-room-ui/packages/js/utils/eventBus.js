import Vue from 'vue';

// 创建全局唯一的 EventBus 实例
export const EventBus = new Vue();

// 创建唯一的事件处理函数
function dataInitHandler(_this, formData, bindComponents) {
  bindComponents?.forEach(com => {
    const maps = com.maps;
    const filterList = maps?.map(param => ({
      column: param.targetField,
      operator: param.queryRule,
      value: formData[param.sourceField],
    }));

    _this.$nextTick(() => {
      if (_this.$refs[com.componentKey] && _this.$refs[com.componentKey].dataInit) {
        _this.$refs[com.componentKey].dataInit(filterList);
      }
    });
  });
}

// 注册事件监听器
export function dataInit(_this) {
  EventBus.$on('dataInit', (formData, bindComponents) => {
    // 在回调中调用处理函数并传递组件实例
    dataInitHandler(_this, formData, bindComponents);
  });
}

export function destroyedEvent() {
  EventBus.$off('dataInit', dataInitHandler);
}
