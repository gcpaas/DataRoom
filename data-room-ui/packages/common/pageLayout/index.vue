<!--
@name:
@description:大屏、仪表盘、资源库等模块的公共布局：左侧是目录树，右侧是内容展示
@author: lsy
@time:2024-03-11
-->
<template>
  <div class="dataroom-manage-layout-wrap">
    <side-menu
      :page-type="pageType"
      @getPageInfo="getPageInfo"
    />
    <Resource
      v-if="pageType === 'resource'"
      :catalog-info="catalogInfo"
      :page-type="pageType"
    />
    <page-list
      v-if="pageType === 'page'"
      :key="pageType"
      :catalog-info="catalogInfo"
      :page-type="pageType"
    />
    <custom-component
      v-if="pageType === 'component'"
      :key="pageType"
      :catalog-info="catalogInfo"
      :page-type="pageType"
    />
  </div>
</template>
<script>
import SideMenu from './SideMenu'
import PageList from '@gcpaas/data-room-ui/packages/common/pageList/index.vue'
import Resource from '@gcpaas/data-room-ui/packages/resource/index.vue'
import customComponent from '@gcpaas/data-room-ui/packages/customComponent/index.vue'
export default {
  name: '',
  props: {
  },
  components: { SideMenu, PageList, Resource, customComponent },
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
  computed: {
    pageType () {
      return this.$route.query.type || 'page'
    }
  },
  watch: {
    //  切换页面时左侧菜单栏重置为【全部】
    pageType () {
      this.catalogInfo = {
        isAll: true,
        page: {
          id: '',
          code: '',
          name: ''
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
.dataroom-manage-layout-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  box-sizing: border-box;
}
</style>
