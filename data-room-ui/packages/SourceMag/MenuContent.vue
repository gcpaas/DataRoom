<template>
  <div class="right-screen-list-wrap">
    <SourceList
      :catalog-info="catalogInfo"
      :type="type"
    />
  </div>
</template>
<script>
import SourceList from 'data-room-ui/SourceList'
export default {
  name: '',
  props: {
    catalogInfo: {
      type: Object,
      default: () => ({
        isAll: false,
        page: {}
      })
    },
    type: {
      type: String,
      default: 'bigScreen'
    }
  },
  components: { SourceList },
  data () {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.right-screen-list-wrap {
  width: 100%;
  // height: 100%;
}
</style>
