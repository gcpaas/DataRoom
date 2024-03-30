<template>
  <div class="">
    <router-link :to="{path:'/page-list',query: { type: 'page' }}">
      大屏列表页面
    </router-link>
    <router-link :to="{path:'/page-list',query: { type: 'page' }}">
      仪表盘列表页面
    </router-link>
    <router-link :to="{path:'/page-list',query: { type: 'resource' }}">
      资源库列表页面
    </router-link>
    <router-link to="/big-screen/datasource">
      数据源管理
    </router-link>
    <router-link to="big-screen/dataSet">
      数据集管理
    </router-link>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {}
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
  }
}
</script>

<style scoped lang="scss">

</style>
