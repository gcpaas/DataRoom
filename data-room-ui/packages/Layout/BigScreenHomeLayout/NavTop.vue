<template>
  <div class="nav-main">
    <span
      v-for="nav in navs"
      :key="nav.id"
      class="nav-span"
      :class="{ 'nav-active': activeNav === nav.id }"
    >
      <a
        class="nav-link"
        @click="toggleNav(nav)"
      >
        <span class="nav-icon">
          <i :class="['iconfont-bigscreen', nav.icon]" />
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
      activeNav: 0
    }
  },
  props: {
    navs: {
      type: Array,
      required: true
    }
  },
  watch: {
    $route () {
      const nav = this.navs.find(m => m.path === this.$route.path)
      if (nav) {
        this.activeNav = nav.id
      }
    }
  },
  mounted () {
    const nav = this.navs.find(m => m.path === this.$route.path)
    this.activeNav = nav ? nav.id : 0
  },
  beforeDestroy () {
  },
  methods: {
    toggleNav (nav) {
      this.activeNav = nav.id
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
    top: 3px;
    background-image: url('./images/line.png');
    background-repeat: repeat-x;
    background-position: 0 34px;

    .nav-link {
      display: flex;
      align-items: center;
      transition: color 0.2s;
      text-decoration: none !important;
      color: var(--bs-el-title);
      width: auto;
      min-width: 140px;
      line-height: 40px;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      padding: 0 40px;

      &.nav-active,
      &:hover {
        color: var(--bs-el-text) !important;
      }
    }

    .nav-icon {
      margin-right: 5px;
    }

    &.nav-active {
      background-image: url('./images/tab.png');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: center bottom;
      /* border-bottom: 1px solid var(--bs-background-1); */
      /* background-color: var(--bs-background-1) */
    }

  }

  .nav-span-last {
    flex: 1;
  }
}
</style>
