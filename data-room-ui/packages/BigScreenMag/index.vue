<template>
  <div class="bs-manage-main-wrap">
    <side-menu
      :type="type"
      @getPageInfo="getPageInfo"
    />
    <menu-content
      :catalog-info="catalogInfo"
      :type="type"
    />
  </div>
</template>
<script>
import SideMenu from './SideMenu'
import MenuContent from './MenuContent'
export default {
  name: '',
  props: {
    type: {
      type: String,
      default: 'bigScreenCatalog'
    }
  },
  components: { SideMenu, MenuContent },
  data () {
    return {
      catalogInfo: {
        isAll: true,
        page: {
          id: null,
          code: null,
          type: ''
        }
      }
    }
  },
  mounted () {},
  methods: {
    getPageInfo (pageInfo) {
      this.catalogInfo = pageInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-manage-main-wrap {
  display: flex;
  height: 100%;
}
</style>
