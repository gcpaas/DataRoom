<template>
  <div class="right-screen-list-wrap">
    <ComponentList
      :catalog-info="catalogInfo"
    />
  </div>
</template>
<script>
import ComponentList from 'data-room-ui/ComponentList'
export default {
  name: '',
  props: {
    catalogInfo: {
      type: String,
      default: 'component'
    }
  },
  components: { ComponentList },
  data () {
    return { }
  }
}
</script>

<style lang="scss" scoped>
.right-screen-list-wrap {
  width: 100%;
  // height: 100%;
}
</style>
