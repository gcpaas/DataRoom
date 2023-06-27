const refreshComponentMixin = {
  data () {
    return {
      updateKey: 0
    }
  },
  computed: {
    Data () {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    Data: {
      handler (newVal, oldVal) {
        this.$nextTick(() => {
          if ((newVal.w !== oldVal.w) || (newVal.h !== oldVal.h)) {
            this.updateKey = new Date().getTime()
          }
        })
      },
      deep: true
    }
  },
  methods: {
    // 由于静态组件没有混入公共函数，所以需要定义一个changeStyle方法，以免报错
    changeStyle () {
    }
  }
}

export { refreshComponentMixin }
