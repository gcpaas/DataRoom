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
  }
}

export { refreshComponentMixin }
