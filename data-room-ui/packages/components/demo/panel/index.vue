<template>
  <div>
    demo 配置面板
  </div>
</template>
<script>
export default {
  name: 'DemoPanel',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
