<template>
  <icon-svg
    :name="config.icon"
    class="page-opt-list-icon icon-box"
  />
</template>

<script>
import IconSvg from 'packages/SvgIcon'
export default {
  name: 'Svgs',
  components: {
    IconSvg
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-box {
  width: 100%;
  height: 100%;
}
</style>
