<template>
  <div class="right-screen-list-wrap">
    <ComponentList
      :catalog-info="catalogInfo"
    />
  </div>
</template>
<script>
import ComponentList from 'packages/ComponentList'
export default {
  name: '',
  props: {
    catalogInfo: {
      type: String,
      default: ''
    }
  },
  components: { ComponentList },
  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
.right-screen-list-wrap {
  width: 100%;
}
</style>
