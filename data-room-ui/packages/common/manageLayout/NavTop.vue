<template>
  <div class="nav-main">
    <span
      v-for="nav in navs"
      :key="nav.type"
      class="nav-span"
      :class="{ 'nav-active': activeNav === nav.type }"
    >
      <a
        class="nav-link"
        @click="toggleNav(nav)"
      >
        <span class="nav-icon">
          <!-- <i :class="['iconfont-bigscreen', nav.icon]" /> -->
        </span>
        {{ nav.name }}
      </a>
    </span>
    <span class="nav-span nav-span-last" />
  </div>
</template>

<script lang='ts'>
export default {
  name: 'NavMain',
  components: {},
  data () {
    return {
      nc: null,
      activeNav: 'page'
    }
  },
  props: {
    navs: {
      type: Array,
      required: true
    }
  },
  watch: {
  },
  mounted () {
    this.initNav()
  },
  beforeDestroy () {
  },
  methods: {
    initNav () {
      const query = this.$route.query
      let nav = null
      // 如果有type参数，则取type对应的nav
      // 否则取当前路由对应的nav
      if (query && query.type) {
        nav = this.navs.find(m => m.type === query.type)
      } else {
        nav = this.navs.find(m => m.path === this.$route.path)
      }
      this.activeNav = nav && nav.type ? nav.type : 'page'
    },
    toggleNav (nav) {
      this.activeNav = nav.type
      this.$emit('change', nav)
    }
  }

}
</script>

<style lang="scss" scoped>
.nav-main {
  z-index: 10;
  display: flex;
  top: 30px;
  position: sticky;
  width: 100%;
  margin-top: 109px;
  min-width: 1024px;
  user-select: none;

  .nav-span {
    position: relative;
    top: 1px;
    // background-image: url('./images/line.png');
    background-repeat: repeat-x;
    background-position: 0 34px;

    .nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      text-decoration: none !important;
      color: #36474f;
      width: 140px;
      min-width: 140px;
      line-height: 40px;
      font-size: 14px;
      text-align: left;
      cursor: pointer;

      &.nav-active,
      &:hover {
        //color: var(--bs-el-text) !important;
      }
    }

    .nav-icon {
      margin-right: 5px;
    }

    &.nav-active {
      background-color: #F5F7FA;
      &:after{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #409EFF;
      }
    }

  }

  .nav-span-last {
    flex: 1;
  }
}
</style>
