<template>
  <div class="big-screen-home-wrap">
    <header class="big-screen-home-wrap-top">
      <div class="logo-title">
        <img
          class="logo"
          :src="logo"
        >
        <span>{{ title }}</span><span style="font-size: 18px;margin-left: 8px">2.x</span>
      </div>

      <div class="big-screen-nav-container">
        <Nav
          :navs="tabList"
          @change="changeTab"
        />
      </div>
      <a
        v-if="giteeSvg && giteeHref"
        class="fork-me-on-gitee"
        :href="giteeHref"
        target="_blank"
      >
        <img
          :src="giteeSvg"
          alt="Fork me on Gitee"
        >
      </a>
    </header>
    <div class="big-screen-router-view-wrap">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import Nav from './NavTop.vue'
// import Nav from './Nav.vue'
export default {
  name: 'BigScreenHome',
  components: {
    Nav
  },
  props: [],
  data () {
    return {
      // 和此处路由保持一致，将会激活tab，请按需更改
      giteeHref: '',
      giteeSvg: ''
    }
  },
  computed: {
    title () {
      if (this.$route.query.edit) return '大屏设计器'
      return window?.BS_CONFIG?.starter?.title ?? 'DataRoom大屏设计器'
    },
    logo () {
      return window?.BS_CONFIG?.starter?.logo ?? require('./images/logo.png')
    },
    tabList () {
      if (this.$route.query.edit) {
        return [
          {
            id: 1,
            name: '资源库',
            path: window?.BS_CONFIG?.routers?.sourceUrl || '/big-screen-source',
            icon: 'icon-tupian'
          },
          {
            id: 2,
            name: '组件库',
            path: window?.BS_CONFIG?.routers?.componentUrl || '/big-screen-components',
            icon: 'icon-zujian1'
          }
        ]
      }
      return [
        {
          id: 0,
          name: '大屏管理',
          path: window?.BS_CONFIG?.routers?.pageListUrl || '/big-screen-list',
          icon: 'icon-icon-shujudaping'
        },
        // {
        //   id: 1,
        //   name: '模版管理',
        //   path: window?.BS_CONFIG?.routers?.templateListUrl || '/big-screen-template',
        //   icon: 'icon-xiangmuwenjianmobanku_mobanku'
        // },
        {
          id: 1,
          name: '资源库',
          path: window?.BS_CONFIG?.routers?.sourceUrl || '/big-screen-source',
          icon: 'icon-tupian'
        },
        {
          id: 2,
          name: '组件库',
          path: window?.BS_CONFIG?.routers?.componentUrl || '/big-screen-components',
          icon: 'icon-zujian1'
        },
        {
          id: 3,
          name: '数据源管理',
          path:
            window?.BS_CONFIG?.routers?.dataSourceUrl ||
            '/big-screen-dataSource',
          icon: 'icon-datafull'
        },
        {
          id: 4,
          name: '数据集管理',
          path: window?.BS_CONFIG?.routers?.dataSetUrl || '/big-screen-dataSet',
          icon: 'icon-data'
        },
        {
          id: 5,
          name: '地图数据管理',
          path: '/big-screen-map-data',
          icon: 'icon-data'
        }
      ]
    }
  },
  created () {
    document.title = this.title
  },
  mounted () {
    this.giteeHref = 'https://gitee.com/gcpaas/DataRoom'
    this.giteeSvg = 'https://gitee.com/gcpaas/DataRoom/widgets/widget_1.svg?color=007bff'
  },
  methods: {
    changeTab (tab) {
      if (this.$route.query.edit) {
        this.$router.push({
          path: tab.path,
          query: { edit: 1 }
        })
      } else {
        this.$router.push({
          path: tab.path
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.big-screen-home-wrap > * {
  box-sizing: border-box;
}
.big-screen-home-wrap {
  height: 100%;

  .big-screen-home-wrap-top {
    position: fixed;
    top: 0;
    width: 100%;
    height: 150px;
    background-image: url('./images/nav_img.png');
    background-size: 100% 150px;
    background-color: #0D0F12;
    background-position: center right;

    .logo-title {
      // 禁用可选
      user-select: none;
      font-size: 30px;
      position: absolute;
      z-index: 23;
      top: 40px;
      left: 40px;
      display: flex;
      align-items: center;
      color: var(--bs-el-color-primary);

      .logo {
        height: 30px;
      }

      span {
        font-family: Source Han Sans CN;
        font-size: 30px;
        font-weight: 700;
        padding-left: 8px;
        -webkit-background-clip: text;
        background-size: 400% 400%;
      }
    }
  }

  .big-screen-router-view-wrap {
    position: absolute;
    top: 150px;
    overflow: hidden;
    // padding-top: 16px;
    width: 100%;
    height: calc(100vh - 150px);
    background-color: var(--bs-background-1);
    box-sizing: border-box;
    padding-top: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }
}

@keyframes text-animate {
  0% {
    background-position: 0 0;
    -webkit-background-clip: text;
  }

  50% {
    background-position: 0 0;
    -webkit-background-clip: text;
  }

  100% {
    background-position: 0 0;
    -webkit-background-clip: text;
  }
}
.fork-me-on-gitee{
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
  img{
    width: 120px;
    height: 120px;
  }
}
</style>
