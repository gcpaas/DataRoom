<template>
  <div class="bs-manage-main-wrap">
    <side-menu />
    <menu-content />
  </div>
</template>
<script>
import SideMenu from './SideMenu'
import MenuContent from './MenuContent'
export default {
  name: '',
  props: {
  },
  components: { SideMenu, MenuContent },
  data () {
    return {
    }
  },
  mounted () { },
  methods: {}
}
</script>

<style lang="scss" scoped>
.bs-manage-main-wrap {
  display: flex;
  height: 100%;
  background-color: var(--bs-background-1);
  // padding-top: 16px;
}
</style>
